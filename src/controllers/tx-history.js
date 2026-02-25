const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

const RPC_BASE = 'https://mainnet-rpc.paxinet.io';

const _tokenCache = new Map();
const TOKEN_CACHE_TTL = 10 * 60 * 1000;

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

// tx_search attributes are always plain text — no base64 decoding needed.
const attrsToMap = (attrs = []) => {
    const result = {};
    for (const a of attrs) {
        const k = a.key;
        const v = a.value;
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
    return null;
};

// Fee events = no msg_index. Message events = have msg_index "0", "1", etc.
const groupEvents = (events) => {
    const groups = {};
    const feeEvents = [];

    for (const ev of events) {
        const attrs = attrsToMap(ev.attributes);
        const idx = attrs.msg_index;
        const entry = { type: ev.type, attrs };

        if (idx === undefined || idx === null || idx === '') {
            feeEvents.push(entry);
        } else {
            const key = String(idx);
            if (!groups[key]) groups[key] = [];
            groups[key].push(entry);
        }
    }

    return { groups, feeEvents };
};

const extractFee = (feeEvents) => {
    for (const ev of feeEvents) {
        if (ev.type === 'tx' && ev.attrs.fee) {
            return parseCoin(ev.attrs.fee);
        }
    }
    return null;
};

const parseMsgGroup = (events, address) => {
    const result = {
        type: 'unknown',
        from: null,
        to: null,
        contractAddress: null,
        amounts: []
    };

    const msgEv = events.find(ev => ev.type === 'message' && ev.attrs.action);
    const action = msgEv?.attrs.action || '';
    const sender = msgEv?.attrs.sender || null;

    // ── SWAP ──
    if (action.includes('MsgSwap') || action.includes('/x.swap')) {
        result.type = 'swap';
        result.from = sender;

        for (const ev of events) {
            if (ev.type === 'wasm') {
                const wa = ev.attrs.action;
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (!rawAmt) continue;

                if (wa === 'transfer_from' && ev.attrs.from === address) {
                    result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                    if (!result.contractAddress) result.contractAddress = contract;
                }

                if (wa === 'transfer' && ev.attrs.to === address) {
                    result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
                }
            }

            if (ev.type === 'coin_spent' && ev.attrs.spender === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) {
                    result.amounts.push({ token: coin.symbol, amount: -coin.value });
                    result.from = address;
                }
            }

            if (ev.type === 'coin_received' && ev.attrs.receiver === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: coin.value });
            }
        }

        return result;
    }

    // ── PROVIDE LIQUIDITY ──
    if (action.includes('ProvideLiquidity') || action.includes('provide_liquidity') || action.includes('AddLiquidity')) {
        result.type = 'provide_liquidity';
        result.from = sender;

        for (const ev of events) {
            if (ev.type === 'wasm') {
                const wa = ev.attrs.action;
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (!rawAmt) continue;

                if ((wa === 'transfer_from' || wa === 'transfer') && ev.attrs.from === address) {
                    result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                    if (!result.contractAddress) result.contractAddress = contract;
                }

                if (wa === 'mint' && ev.attrs.to === address) {
                    result.amounts.push({ token: 'LP', raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
                }
            }

            if (ev.type === 'coin_spent' && ev.attrs.spender === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: -coin.value });
            }
        }

        return result;
    }

    // ── WITHDRAW LIQUIDITY ──
    if (action.includes('WithdrawLiquidity') || action.includes('withdraw_liquidity') || action.includes('RemoveLiquidity')) {
        result.type = 'withdraw_liquidity';
        result.from = sender;

        for (const ev of events) {
            if (ev.type === 'wasm') {
                const wa = ev.attrs.action;
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (!rawAmt) continue;

                if (wa === 'burn' && ev.attrs.from === address) {
                    result.amounts.push({ token: 'LP', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                    if (!result.contractAddress) result.contractAddress = contract;
                }

                if (wa === 'transfer' && ev.attrs.to === address) {
                    result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
                }
            }

            if (ev.type === 'coin_received' && ev.attrs.receiver === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (coin?.symbol) result.amounts.push({ token: coin.symbol, amount: coin.value });
            }
        }

        return result;
    }

    // ── NATIVE SEND/RECEIVE ──
    if (action.includes('MsgSend') || action.includes('cosmos.bank')) {
        for (const ev of events) {
            if (ev.type === 'coin_spent' && ev.attrs.spender === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (!coin?.symbol) continue;
                result.type = 'send';
                result.from = address;
                result.amounts.push({ token: coin.symbol, amount: -coin.value });
            }

            if (ev.type === 'coin_received' && ev.attrs.receiver === address) {
                const coin = parseCoin(ev.attrs.amount);
                if (!coin?.symbol) continue;
                if (result.type === 'unknown') result.type = 'receive';
                result.to = address;
                result.amounts.push({ token: coin.symbol, amount: coin.value });
            }

            if (ev.type === 'transfer') {
                if (ev.attrs.recipient === address) {
                    result.from = ev.attrs.sender || result.from;
                    result.to = address;
                } else if (ev.attrs.sender === address) {
                    result.to = ev.attrs.recipient || result.to;
                }
            }
        }

        return result;
    }

    // ── WASM EXECUTE (PRC20 transfer / burn) ──
    if (action.includes('MsgExecuteContract') || action.includes('cosmwasm.wasm')) {
        for (const ev of events) {
            if (ev.type !== 'wasm') continue;

            const wa = ev.attrs.action;
            const contract = ev.attrs._contract_address;
            const rawAmt = parseCoin(ev.attrs.amount);
            if (!rawAmt) continue;

            if (wa === 'transfer' && ev.attrs.from === address) {
                result.type = 'send';
                result.from = address;
                result.to = ev.attrs.to || null;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }

            if (wa === 'transfer' && ev.attrs.to === address && ev.attrs.from !== address) {
                if (result.type === 'unknown') result.type = 'receive';
                result.from = result.from || ev.attrs.from || null;
                result.to = address;
                if (!result.contractAddress) result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
            }

            if (wa === 'transfer_from' && ev.attrs.from === address) {
                result.type = 'send';
                result.from = address;
                result.to = ev.attrs.to || null;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }

            if (wa === 'burn' && ev.attrs.from === address) {
                result.type = 'burn';
                result.from = address;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }
        }

        if (!result.from) result.from = sender;
        return result;
    }

    // ── Fallback ──
    for (const ev of events) {
        if (ev.type === 'transfer') {
            const coin = parseCoin(ev.attrs.amount);
            if (!coin?.symbol) continue;

            if (ev.attrs.sender === address) {
                result.type = 'send';
                result.from = address;
                result.to = ev.attrs.recipient || null;
                result.amounts.push({ token: coin.symbol, amount: -coin.value });
            } else if (ev.attrs.recipient === address) {
                result.type = 'receive';
                result.from = ev.attrs.sender || null;
                result.to = address;
                result.amounts.push({ token: coin.symbol, amount: coin.value });
            }
        }
    }

    if (!result.from) result.from = sender;
    return result;
};

// Normalize a tx from tx_search (tx_result.events)
const normalizeTx = (t, address) => {
    const events = t.tx_result?.events || [];

    const result = {
        hash: t.hash,
        type: 'unknown',
        status: t.tx_result?.code === 0 ? 'success' : 'failed',
        timestamp: null,
        block: t.height,
        from: null,
        to: null,
        contractAddress: null,
        fee: null,
        amounts: []
    };

    if (!events.length) return result;

    const { groups, feeEvents } = groupEvents(events);

    const feeInfo = extractFee(feeEvents);
    if (feeInfo?.symbol) result.fee = { token: feeInfo.symbol, amount: feeInfo.value };

    const fallbackSender = feeEvents.find(e => e.type === 'message' && e.attrs.sender)?.attrs.sender || null;

    const msgIndexes = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));

    if (!msgIndexes.length) {
        if (fallbackSender) result.from = fallbackSender;
        return result;
    }

    const parsedMsgs = msgIndexes.map(idx => parseMsgGroup(groups[idx], address));

    const typePriority = ['swap', 'provide_liquidity', 'withdraw_liquidity', 'burn', 'send', 'receive'];
    let dominant = parsedMsgs[0];
    for (const msg of parsedMsgs) {
        const p = typePriority.indexOf(msg.type);
        const dp = typePriority.indexOf(dominant.type);
        if (p !== -1 && (dp === -1 || p < dp)) dominant = msg;
    }

    result.type = dominant.type;
    result.from = dominant.from || fallbackSender;
    result.to = dominant.to;
    result.contractAddress = dominant.contractAddress;

    if (parsedMsgs.length === 1) {
        result.amounts = dominant.amounts;
    } else {
        const domIdx = parsedMsgs.indexOf(dominant);
        result.amounts = [...dominant.amounts];
        for (let i = 0; i < parsedMsgs.length; i++) {
            if (i === domIdx) continue;
            const msg = parsedMsgs[i];
            if (msg.type === 'unknown' || msg.amounts.length === 0) continue;
            for (const amt of msg.amounts) result.amounts.push(amt);
        }
    }

    return result;
};

const resolveTokenSymbols = async (txList) => {
    const contracts = new Set();
    txList.forEach(tx => {
        tx.amounts.forEach(a => {
            if (a.contractAddress && (a.token === 'PRC20' || a.token === 'LP')) {
                contracts.add(a.contractAddress);
            }
        });
    });

    await Promise.allSettled([...contracts].map(addr => getTokenInfo(addr)));

    txList.forEach(tx => {
        tx.amounts.forEach(a => {
            if (!a.contractAddress) return;
            if (a.token !== 'PRC20' && a.token !== 'LP') return;

            const info = _tokenCache.get(a.contractAddress);
            const decimals = info?.decimals ?? 6;
            const symbol = info?.symbol || a.contractAddress.slice(0, 8) + '…';

            a.token = a.token === 'LP' ? `${symbol}-LP` : symbol;
            a.amount = (a._sign || 1) * (a.raw / Math.pow(10, decimals));
            delete a.raw;
            delete a._sign;
        });

        tx.amounts.forEach(a => { delete a._sign; delete a.raw; });
    });
};

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
            `transfer.recipient='${address}'`,
            `coin_received.receiver='${address}'`
        ];

        const allTxs = [];
        const seen = new Set();

        await Promise.all(queries.map(async (q) => {
            const url =
                `${RPC_BASE}/tx_search` +
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

        // Fetch timestamps
        const heights = [...new Set(normalized.map(tx => tx.block))].slice(0, 30);
        const heightMap = {};

        await Promise.allSettled(
            heights.map(async (h) => {
                const r = await fetch(`${RPC_BASE}/block?height=${h}`, { timeout: 5000 });
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
