const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

const FEE_COLLECTORS = new Set([]);

const _tokenCache = new Map();
const TOKEN_CACHE_TTL = 10 * 60 * 1000;

// ───────────────── TOKEN INFO ─────────────────

const getTokenInfo = async (contractAddress) => {
    if (!contractAddress) return null;

    const cached = _tokenCache.get(contractAddress);
    if (cached && Date.now() - cached.ts < TOKEN_CACHE_TTL) return cached;

    try {
        const url = `https://explorer.paxinet.io/api/prc20/contract?address=${contractAddress}`;
        const r = await fetch(url, { timeout: 6000 });
        if (!r.ok) return null;

        const data = await r.json();
        const c = data?.data?.contract || data?.contract || data;

        const info = {
            symbol: (c.symbol || '').toUpperCase() || null,
            decimals: parseInt(c.decimals ?? 6),
            ts: Date.now()
        };

        if (info.symbol) _tokenCache.set(contractAddress, info);
        return info;
    } catch {
        return null;
    }
};

// ───────────────── HELPERS ─────────────────

const decodeB64 = (str) => {
    if (!str) return '';
    try { return Buffer.from(str, 'base64').toString(); }
    catch { return str; }
};

const decodeAttrs = (attrs = []) => {
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

const parseCoin = (str) => {
    if (!str) return null;

    const m = str.match(/^(\d+)([a-zA-Z][a-zA-Z0-9/]*)$/);
    if (m) {
        const raw = parseInt(m[1]);
        const denom = m[2];
        const symbol = denom === 'upaxi' ? 'PAXI' : denom.replace(/^u/, '').toUpperCase();
        return { raw, symbol, value: raw / 1e6 };
    }

    const n = parseInt(str);
    if (!isNaN(n)) return { raw: n };

    return null;
};

// ───────────────── NORMALIZE ─────────────────

const normalizeTx = (t, address) => {
    const events = t.tx_result?.events || [];
    const decoded = events.map(ev => ({
        type: ev.type,
        attrs: decodeAttrs(ev.attributes)
    }));

    const result = {
        hash: t.hash,
        type: 'unknown',
        status: t.tx_result?.code === 0 ? 'success' : 'failed',
        timestamp: null,
        block: t.height,
        from: null,
        to: null,
        contractAddress: null,
        amounts: []
    };

    if (!decoded.length) return result;

    // ───── Detect message action ─────
    for (const ev of decoded) {
        if (ev.type !== 'message') continue;

        const action = ev.attrs.action;
        if (!action) continue;

        if (action.includes('MsgSwap') || action.includes('swap')) result.type = 'swap';
        if (action.includes('ProvideLiquidity')) result.type = 'provide_liquidity';
        if (action.includes('WithdrawLiquidity')) result.type = 'withdraw_liquidity';
        if (action.includes('MsgBurn') || action.includes('burn')) result.type = 'burn';
    }

    // ───── WASM (PRC20) ─────
    for (const ev of decoded) {
        if (ev.type !== 'wasm') continue;

        const action = ev.attrs.action;
        const contract = ev.attrs._contract_address;
        const rawAmt = parseCoin(ev.attrs.amount);
        if (!rawAmt) continue;

        if (action === 'transfer' && (ev.attrs.from === address || ev.attrs.to === address)) {
            const isOut = ev.attrs.from === address;

            if (result.type === 'unknown')
                result.type = isOut ? 'send' : 'receive';

            result.from = ev.attrs.from;
            result.to = ev.attrs.to;
            result.contractAddress = contract;

            result.amounts.push({
                token: 'PRC20',
                raw: rawAmt.raw,
                contractAddress: contract,
                _sign: isOut ? -1 : 1
            });
        }

        if (action === 'transfer_from' && ev.attrs.from === address) {
            if (result.type === 'unknown')
                result.type = 'send';

            result.from = ev.attrs.from;
            result.to = ev.attrs.to;
            result.contractAddress = contract;

            result.amounts.push({
                token: 'PRC20',
                raw: rawAmt.raw,
                contractAddress: contract,
                _sign: -1
            });
        }

        if (action === 'burn' && ev.attrs.from === address) {
            result.type = 'burn';
            result.from = address;
            result.contractAddress = contract;

            result.amounts.push({
                token: 'PRC20',
                raw: rawAmt.raw,
                contractAddress: contract,
                _sign: -1
            });
        }
    }

    // ───── Native PAXI ─────
    for (const ev of decoded) {
        if (ev.type === 'coin_spent' && ev.attrs.spender === address) {
            const coin = parseCoin(ev.attrs.amount);
            if (!coin?.symbol) continue;

            if (result.type === 'unknown')
                result.type = 'send';

            result.from = address;

            result.amounts.push({
                token: coin.symbol,
                amount: -coin.value
            });
        }

        if (ev.type === 'coin_received' && ev.attrs.receiver === address) {
            const coin = parseCoin(ev.attrs.amount);
            if (!coin?.symbol) continue;

            if (result.type === 'unknown')
                result.type = 'receive';

            result.to = address;

            result.amounts.push({
                token: coin.symbol,
                amount: coin.value
            });
        }
    }

    // fallback from
    if (!result.from) {
        const msg = decoded.find(e => e.type === 'message' && e.attrs.sender);
        if (msg) result.from = msg.attrs.sender;
    }

    return result;
};

// ───────────────── RESOLVE PRC20 ─────────────────

const resolveTokenSymbols = async (txList) => {
    const contracts = new Set();

    txList.forEach(tx => {
        tx.amounts.forEach(a => {
            if (a.contractAddress) contracts.add(a.contractAddress);
        });
    });

    await Promise.allSettled([...contracts].map(addr => getTokenInfo(addr)));

    txList.forEach(tx => {
        tx.amounts.forEach(a => {
            if (a.token === 'PRC20' && a.contractAddress) {
                const info = _tokenCache.get(a.contractAddress);
                const decimals = info?.decimals ?? 6;
                const symbol = info?.symbol || a.contractAddress.slice(0, 6) + '…';

                a.token = symbol;
                a.amount = (a._sign || 1) * (a.raw / Math.pow(10, decimals));

                delete a.raw;
                delete a._sign;
            }
        });
    });
};

// ───────────────── MAIN ─────────────────

const txHistoryHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address, page = 1, limit = 20 } = req.query || {};
    if (!address || !isValidPaxiAddress(address))
        return sendResponse(res, false, null, 'Invalid address', 400);

    try {
        const queries = [
            `message.sender='${address}'`,
            `transfer.recipient='${address}'`
        ];

        const allTxs = [];
        const seen = new Set();

        await Promise.all(queries.map(async (q) => {
            const url =
                `https://mainnet-rpc.paxinet.io/tx_search` +
                `?query=${encodeURIComponent(q)}` +
                `&page=1&per_page=100&order_by=desc`;

            const r = await fetch(url, { timeout: 8000 });
            if (!r.ok) return;

            const data = await r.json();
            const txs = data?.result?.txs || [];

            txs.forEach(tx => {
                if (!seen.has(tx.hash)) {
                    seen.add(tx.hash);
                    allTxs.push(tx);
                }
            });
        }));

        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));

        const normalized = allTxs.map(t => normalizeTx(t, address));

        // timestamp
        const heights = [...new Set(normalized.map(tx => tx.block))].slice(0, 30);
        const heightMap = {};

        await Promise.allSettled(
            heights.map(async (h) => {
                const r = await fetch(`https://mainnet-rpc.paxinet.io/block?height=${h}`);
                if (!r.ok) return;
                const d = await r.json();
                const ts = d?.result?.block?.header?.time;
                if (ts) heightMap[h] = ts;
            })
        );

        normalized.forEach(tx => {
            tx.timestamp = heightMap[tx.block] || null;
        });

        await resolveTokenSymbols(normalized);

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

    } catch (err) {
        console.error(err);
        return sendResponse(res, false, null, 'Failed to fetch transaction history', 500);
    }
};

module.exports = txHistoryHandler;