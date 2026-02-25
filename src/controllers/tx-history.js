const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

// ─── Fee collector — transfers ke sini adalah fee payment, bukan real tx ───
const FEE_COLLECTORS = new Set([
    'paxi17xpfvakm2amg962yls6f84z3kell8c5ln9803d',
]);

// ─── In-memory token symbol cache ─────────────────────────────────────────
//   key: contractAddress (string)
//   value: { symbol, name, decimals, ts } — ts untuk TTL 10 menit
const _tokenCache = new Map();
const TOKEN_CACHE_TTL = 10 * 60 * 1000; // 10 menit

/**
 * Fetch token detail dari /token-detail endpoint internal.
 * Pakai cache agar tidak fetch berulang untuk token yang sama.
 */
const getTokenInfo = async (contractAddress, baseUrl = '') => {
    if (!contractAddress) return null;
    
    const cached = _tokenCache.get(contractAddress);
    if (cached && Date.now() - cached.ts < TOKEN_CACHE_TTL) return cached;
    
    try {
        // Hit endpoint token-detail — bisa via internal URL atau external
        const url = baseUrl ? `https://explorer.paxinet.io/api/prc20/contract?address=${contractAddress}` : '';
        
        const r = await fetch(url, { timeout: 6000 });
        if (!r.ok) return null;
        
        const data = await r.json();
        // Struktur dari tokenDetailHandler: data.contract.symbol / data.data.contract.symbol
        const c = data?.data?.contract || data?.contract || data;
        
        const info = {
            symbol: (c.symbol || '').toUpperCase() || null,
            name: c.name || null,
            decimals: parseInt(c.decimals ?? 6),
            ts: Date.now()
        };
        
        if (info.symbol) _tokenCache.set(contractAddress, info);
        return info;
    } catch {
        return null;
    }
};

// ─── Helpers ───────────────────────────────────────────────────────────────

const decodeB64 = (str) => {
    if (!str) return '';
    try { return Buffer.from(str, 'base64').toString(); }
    catch { return str; }
};

const decodeAttrs = (attrs) => {
    const result = {};
    for (const a of attrs) {
        const k = decodeB64(a.key);
        const v = decodeB64(a.value);
        if (result[k] !== undefined) {
            if (!Array.isArray(result[k])) result[k] = [result[k]];
            result[k].push(v);
        } else {
            result[k] = v;
        }
    }
    return result;
};

/**
 * Parse coin string:
 *   "2471577upaxi" → { raw: 2471577, symbol: 'PAXI', value: 2.471577, hasUnit: true }
 *   "4029255"      → { raw: 4029255, symbol: null,   value: 4.029255, hasUnit: false } ← PRC-20
 */
const parseCoin = (str) => {
    if (!str) return null;
    const m = str.match(/^(\d+)([a-zA-Z][a-zA-Z0-9/]*)$/);
    if (m) {
        const raw = parseInt(m[1]);
        const denom = m[2];
        const symbol = denom === 'upaxi' ? 'PAXI' : denom.replace(/^u/, '').toUpperCase();
        return { raw, symbol, value: raw / 1e6, hasUnit: true };
    }
    const n = parseInt(str);
    if (!isNaN(n)) return { raw: n, symbol: null, value: null, hasUnit: false }; // value akan dihitung pakai decimals
    return null;
};

// ─── Normalize satu raw tx ─────────────────────────────────────────────────

const normalizeTx = (t, address) => {
    const events = t.tx_result.events || [];
    const decoded = events.map(ev => ({
        type: ev.type,
        attrs: decodeAttrs(ev.attributes)
    }));
    
    const result = {
        hash: t.hash,
        type: 'send',
        status: t.tx_result.code === 0 ? 'success' : 'failed',
        timestamp: t.timestamp || null,
        block: t.height,
        from: null,
        to: null,
        contractAddress: null,
        amounts: [],
        _wasmContracts: [] // temp: kumpulkan contract address untuk fetch symbol
    };
    
    // ── Detect primary action dari message events ────────────────────────
    for (const ev of decoded) {
        if (ev.type !== 'message') continue;
        const action = ev.attrs.action;
        if (!action) continue;
        if (action.includes('MsgSwap') || action.includes('swap')) { result.type = 'swap'; break; }
        if (action.includes('ProvideLiquidity')) { result.type = 'provide_liquidity'; break; }
        if (action.includes('WithdrawLiquidity')) { result.type = 'withdraw_liquidity'; break; }
        if (action.includes('MsgBurn') || action.includes('burn')) { result.type = 'burn'; break; }
    }
    
    // ── Contract address dari execute event ─────────────────────────────
    const execEv = decoded.find(e => e.type === 'execute');
    if (execEv) result.contractAddress = execEv.attrs._contract_address || null;
    
    // ── Parse amounts ────────────────────────────────────────────────────
    const t_ = result.type;
    
    if (t_ === 'swap') {
        // PAXI user kirim (coin_spent, msg_index ada, spender=user)
        for (const ev of decoded) {
            if (ev.type !== 'coin_spent' || ev.attrs.msg_index === undefined || ev.attrs.spender !== address) continue;
            const coin = parseCoin(ev.attrs.amount);
            if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: -coin.value, contractAddress: null });
        }
        // PAXI user terima (coin_received, msg_index ada, receiver=user)
        for (const ev of decoded) {
            if (ev.type !== 'coin_received' || ev.attrs.msg_index === undefined || ev.attrs.receiver !== address) continue;
            const coin = parseCoin(ev.attrs.amount);
            if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: coin.value, contractAddress: null });
        }
        // PRC-20 user kirim (wasm transfer_from, from=user)
        for (const ev of decoded) {
            if (ev.type !== 'wasm' || ev.attrs.action !== 'transfer_from' || ev.attrs.from !== address) continue;
            const contract = ev.attrs._contract_address;
            const rawAmt = parseCoin(ev.attrs.amount);
            if (rawAmt) {
                result.amounts.push({ token: 'PRC20', amount: null, raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                if (contract) result._wasmContracts.push(contract);
                if (contract && !result.contractAddress) result.contractAddress = contract;
            }
        }
        // PRC-20 user terima (wasm transfer, to=user)
        for (const ev of decoded) {
            if (ev.type !== 'wasm' || ev.attrs.action !== 'transfer' || ev.attrs.to !== address) continue;
            const contract = ev.attrs._contract_address;
            const rawAmt = parseCoin(ev.attrs.amount);
            if (rawAmt) {
                result.amounts.push({ token: 'PRC20', amount: null, raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
                if (contract) result._wasmContracts.push(contract);
                if (contract && !result.contractAddress) result.contractAddress = contract;
            }
        }
        
    } else if (t_ === 'provide_liquidity') {
        for (const ev of decoded) {
            if (ev.type === 'coin_spent' && ev.attrs.msg_index !== undefined && ev.attrs.spender === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: -coin.value, contractAddress: null });
            }
            if (ev.type === 'wasm' && ev.attrs.action === 'transfer_from' && ev.attrs.from === address) {
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (rawAmt) {
                    result.amounts.push({ token: 'PRC20', amount: null, raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                    if (contract) result._wasmContracts.push(contract);
                    if (contract && !result.contractAddress) result.contractAddress = contract;
                }
            }
        }
        
    } else if (t_ === 'withdraw_liquidity') {
        for (const ev of decoded) {
            if (ev.type === 'coin_received' && ev.attrs.msg_index !== undefined && ev.attrs.receiver === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: coin.value, contractAddress: null });
            }
            if (ev.type === 'wasm' && ev.attrs.action === 'transfer' && ev.attrs.to === address) {
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (rawAmt) {
                    result.amounts.push({ token: 'PRC20', amount: null, raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
                    if (contract) result._wasmContracts.push(contract);
                    if (contract && !result.contractAddress) result.contractAddress = contract;
                }
            }
        }
        
    } else {
        // SEND / RECEIVE / BURN / OTHER
        const wasmTransfer = decoded.find(e =>
            e.type === 'wasm' &&
            e.attrs.action === 'transfer' &&
            (e.attrs.from === address || e.attrs.to === address)
        );
        
        if (wasmTransfer) {
            const contract = wasmTransfer.attrs._contract_address;
            const rawAmt = parseCoin(wasmTransfer.attrs.amount);
            if (rawAmt) {
                const isOut = wasmTransfer.attrs.from === address;
                result.type = isOut ? 'send' : 'receive';
                result.from = wasmTransfer.attrs.from;
                result.to = wasmTransfer.attrs.to;
                result.amounts.push({ token: 'PRC20', amount: null, raw: rawAmt.raw, contractAddress: contract, _sign: isOut ? -1 : 1 });
                if (contract) result._wasmContracts.push(contract);
                if (contract) result.contractAddress = contract;
            }
        } else {
            // Native PAXI transfer (exclude fee)
            const seen = new Set();
            for (const ev of decoded) {
                if (ev.type !== 'transfer') continue;
                if (FEE_COLLECTORS.has(ev.attrs.recipient)) continue;
                const key = `${ev.attrs.amount}-${ev.attrs.sender}-${ev.attrs.recipient}`;
                if (seen.has(key)) continue;
                seen.add(key);
                const coin = parseCoin(ev.attrs.amount);
                if (!coin) continue;
                if (ev.attrs.sender === address) {
                    result.type = 'send';
                    result.from = ev.attrs.sender;
                    result.to = ev.attrs.recipient;
                    result.amounts.push({ token: coin.symbol || 'PAXI', amount: -coin.value });
                } else if (ev.attrs.recipient === address) {
                    result.type = 'receive';
                    result.from = ev.attrs.sender;
                    result.to = ev.attrs.recipient;
                    result.amounts.push({ token: coin.symbol || 'PAXI', amount: coin.value });
                }
            }
        }
    }
    
    // Fallback from
    if (!result.from) {
        const msgEv = decoded.find(e => e.type === 'message' && e.attrs.sender);
        if (msgEv) result.from = msgEv.attrs.sender;
    }
    
    return result;
};

/**
 * Resolve semua PRC-20 amounts yang masih token:'PRC20' + raw
 * → fetch token info → isi symbol & amount pakai decimals
 */
const resolveTokenSymbols = async (txList) => {
    // Kumpulkan semua unique contract addresses
    const contracts = new Set();
    for (const tx of txList) {
        for (const ca of (tx._wasmContracts || [])) {
            if (ca) contracts.add(ca);
        }
    }
    
    if (contracts.size === 0) return;
    
    // Fetch semua secara paralel (dibatasi 10 concurrent)
    const contractArr = [...contracts];
    const BATCH = 10;
    for (let i = 0; i < contractArr.length; i += BATCH) {
        const batch = contractArr.slice(i, i + BATCH);
        await Promise.allSettled(batch.map(addr => getTokenInfo(addr)));
    }
    
    // Apply symbol + amount ke setiap tx
    for (const tx of txList) {
        for (const amt of tx.amounts) {
            if (amt.token === 'PRC20' && amt.contractAddress) {
                const info = _tokenCache.get(amt.contractAddress);
                const decimals = info?.decimals ?? 6;
                const symbol = info?.symbol || amt.contractAddress.slice(0, 6).toUpperCase() + '…';
                amt.token = symbol;
                amt.amount = (amt._sign || 1) * (amt.raw / Math.pow(10, decimals));
                delete amt._sign;
                delete amt.raw;
            }
        }
        delete tx._wasmContracts;
    }
};

// ─── Main Handler ──────────────────────────────────────────────────────────

const txHistoryHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    
    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    
    const { address, page = 1, limit = 20 } = req.query || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address', 400);
    }
    
    try {
        const queries = [
            `message.sender='${address}'`,
            `transfer.recipient='${address}'`
        ];
        
        const allTxs = [];
        const seenHash = new Set();
        
        await Promise.all(queries.map(async (q) => {
            try {
                const url = `https://mainnet-rpc.paxinet.io/tx_search?query="${encodeURIComponent(q)}"&page=1&per_page=100&order_by="desc"`;
                const r = await fetch(url, { timeout: 8000 });
                if (!r.ok) return;
                const data = await r.json();
                if (data.result?.txs) {
                    data.result.txs.forEach(tx => {
                        if (!seenHash.has(tx.hash)) {
                            seenHash.add(tx.hash);
                            allTxs.push(tx);
                        }
                    });
                }
            } catch (e) { console.warn(`Query ${q} failed:`, e.message); }
        }));
        
        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));
        
        const normalized = allTxs.map(t => normalizeTx(t, address));
        
        // ── Fetch timestamps via block header (tx_search tidak include timestamp) ──
        const missingTs = normalized.filter(tx => !tx.timestamp);
        if (missingTs.length > 0) {
            const uniqueHeights = [...new Set(missingTs.map(tx => tx.block))].slice(0, 30);
            const heightTs = {};
            await Promise.allSettled(uniqueHeights.map(async (h) => {
                try {
                    const r = await fetch(`https://mainnet-rpc.paxinet.io/block?height=${h}`, { timeout: 5000 });
                    if (!r.ok) return;
                    const bd = await r.json();
                    const ts = bd.result?.block?.header?.time;
                    if (ts) heightTs[h] = ts;
                } catch (_) {}
            }));
            normalized.forEach(tx => {
                if (!tx.timestamp && heightTs[tx.block]) tx.timestamp = heightTs[tx.block];
            });
        }
        
        // ── Resolve PRC-20 token symbols ────────────────────────────────
        await resolveTokenSymbols(normalized);
        
        // ── Paginate ────────────────────────────────────────────────────
        const p = parseInt(page);
        const l = parseInt(limit);
        const from = (p - 1) * l;
        
        return sendResponse(res, true, {
            total_count: normalized.length,
            transactions: normalized.slice(from, from + l),
            page: p,
            limit: l,
            has_next: from + l < normalized.length
        });
        
    } catch (error) {
        console.error('History Fetch Error:', error);
        return sendResponse(res, false, null, 'Failed to fetch transaction history', 500);
    }
};

module.exports = txHistoryHandler;