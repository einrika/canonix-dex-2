const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

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

/**
 * Events yang hadir di setiap tx tanpa msg_index adalah infrastructure events:
 *  - tx (hash, height, fee, fee_payer, acc_seq, signature)
 *  - coin_spent / coin_received untuk FEE (receiver = fee collector paxi17xpfvakm...)
 *  - message (sender saja, tanpa action)
 *
 * Events dengan msg_index = "0", "1", dst adalah actual message events.
 * Kita kelompokkan events per msg_index untuk parse per-message.
 */
const groupByMsgIndex = (decoded) => {
    const groups = {};           // { msgIndex: [events] }
    const feeEvents = [];        // events tanpa msg_index

    for (const ev of decoded) {
        const idx = ev.attrs.msg_index;
        if (idx === undefined || idx === null || idx === '') {
            feeEvents.push(ev);
        } else {
            const key = String(idx);
            if (!groups[key]) groups[key] = [];
            groups[key].push(ev);
        }
    }
    return { groups, feeEvents };
};

/**
 * Extract fee info dari fee events (sebelum ada msg_index)
 */
const extractFee = (feeEvents) => {
    for (const ev of feeEvents) {
        if (ev.type === 'tx' && ev.attrs.fee) {
            return parseCoin(ev.attrs.fee);
        }
    }
    return null;
};

/**
 * Parse satu message group menjadi typed sub-transaction.
 * Return: { type, from, to, contractAddress, amounts: [{token, raw, amount, contractAddress, _sign}] }
 */
const parseMsgGroup = (events, address) => {
    const result = {
        type: 'unknown',
        from: null,
        to: null,
        contractAddress: null,
        amounts: []
    };

    // Cek action dari message event
    const msgEv = events.find(ev => ev.type === 'message' && ev.attrs.action);
    const action = msgEv?.attrs.action || '';

    // ── 1. SWAP (/x.swap.types.MsgSwap) ──
    if (action.includes('MsgSwap') || action.includes('/x.swap')) {
        result.type = 'swap';
        result.from = msgEv?.attrs.sender || null;

        // Input: wasm transfer_from (PRC20 diambil dari user) atau coin_spent
        // Output: wasm transfer ke user (PRC20) atau coin_received ke user

        for (const ev of events) {
            if (ev.type === 'wasm') {
                const wa = ev.attrs.action;
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (!rawAmt) continue;

                if (wa === 'transfer_from' && ev.attrs.from === address) {
                    // PRC20 input (user give)
                    result.amounts.push({
                        token: 'PRC20',
                        raw: rawAmt.raw,
                        contractAddress: contract,
                        _sign: -1
                    });
                    if (!result.contractAddress) result.contractAddress = contract;
                }

                if (wa === 'transfer' && ev.attrs.to === address) {
                    // PRC20 output (user receive)
                    result.amounts.push({
                        token: 'PRC20',
                        raw: rawAmt.raw,
                        contractAddress: contract,
                        _sign: 1
                    });
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
                if (coin?.symbol) {
                    result.amounts.push({ token: coin.symbol, amount: coin.value });
                }
            }
        }

        return result;
    }

    // ── 2. PROVIDE LIQUIDITY ──
    if (action.includes('ProvideLiquidity') || action.includes('provide_liquidity') || action.includes('AddLiquidity')) {
        result.type = 'provide_liquidity';
        result.from = msgEv?.attrs.sender || null;

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

                // LP token minted ke user
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

    // ── 3. WITHDRAW LIQUIDITY ──
    if (action.includes('WithdrawLiquidity') || action.includes('withdraw_liquidity') || action.includes('RemoveLiquidity')) {
        result.type = 'withdraw_liquidity';
        result.from = msgEv?.attrs.sender || null;

        for (const ev of events) {
            if (ev.type === 'wasm') {
                const wa = ev.attrs.action;
                const contract = ev.attrs._contract_address;
                const rawAmt = parseCoin(ev.attrs.amount);
                if (!rawAmt) continue;

                // LP token diburn dari user
                if (wa === 'burn' && ev.attrs.from === address) {
                    result.amounts.push({ token: 'LP', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
                    if (!result.contractAddress) result.contractAddress = contract;
                }

                // Token diterima user
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

    // ── 4. NATIVE SEND/RECEIVE (/cosmos.bank.v1beta1.MsgSend) ──
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
                if (ev.attrs.sender && result.from === address) result.from = ev.attrs.sender;
                if (ev.attrs.sender && ev.attrs.recipient === address) {
                    result.from = ev.attrs.sender;
                    result.to = address;
                }
                if (ev.attrs.recipient && result.type === 'send') result.to = ev.attrs.recipient;
            }
        }

        return result;
    }

    // ── 5. WASM EXECUTE (PRC20 transfer / burn) ──
    if (action.includes('MsgExecuteContract') || action.includes('cosmwasm.wasm')) {
        for (const ev of events) {
            if (ev.type !== 'wasm') continue;

            const wa = ev.attrs.action;
            const contract = ev.attrs._contract_address;
            const rawAmt = parseCoin(ev.attrs.amount);
            if (!rawAmt) continue;

            // PRC20 transfer (send)
            if (wa === 'transfer' && ev.attrs.from === address) {
                result.type = 'send';
                result.from = address;
                result.to = ev.attrs.to || null;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }

            // PRC20 receive
            if (wa === 'transfer' && ev.attrs.to === address) {
                if (result.type === 'unknown') result.type = 'receive';
                result.from = ev.attrs.from || null;
                result.to = address;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: 1 });
            }

            // PRC20 transfer_from (delegated send, e.g. from dapp)
            if (wa === 'transfer_from' && ev.attrs.from === address) {
                result.type = 'send';
                result.from = address;
                result.to = ev.attrs.to || null;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }

            // PRC20 burn
            if (wa === 'burn' && ev.attrs.from === address) {
                result.type = 'burn';
                result.from = address;
                result.contractAddress = contract;
                result.amounts.push({ token: 'PRC20', raw: rawAmt.raw, contractAddress: contract, _sign: -1 });
            }
        }

        // Fallback sender
        if (!result.from && msgEv?.attrs.sender) result.from = msgEv.attrs.sender;

        return result;
    }

    // ── 6. Fallback: coba baca dari events langsung ──
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

    return result;
};

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
        fee: null,
        amounts: []
    };

    if (!decoded.length) return result;

    const { groups, feeEvents } = groupByMsgIndex(decoded);

    // Extract fee
    const feeInfo = extractFee(feeEvents);
    if (feeInfo?.symbol) {
        result.fee = { token: feeInfo.symbol, amount: feeInfo.value };
    }

    const msgIndexes = Object.keys(groups).sort((a, b) => parseInt(a) - parseInt(b));

    if (!msgIndexes.length) {
        // Tx hanya punya infra events (unlikely tapi handle saja)
        return result;
    }

    // Parse setiap message
    const parsedMsgs = msgIndexes.map(idx => parseMsgGroup(groups[idx], address));

    // Kalau hanya 1 message, langsung pakai hasilnya
    if (parsedMsgs.length === 1) {
        const m = parsedMsgs[0];
        result.type = m.type;
        result.from = m.from;
        result.to = m.to;
        result.contractAddress = m.contractAddress;
        result.amounts = m.amounts;
        return result;
    }

    // Multi-message tx: tentukan tipe dominan
    // Prioritas: swap > provide_liquidity > withdraw_liquidity > burn > send > receive
    const typePriority = ['swap', 'provide_liquidity', 'withdraw_liquidity', 'burn', 'send', 'receive'];
    let dominantMsg = parsedMsgs[0];
    for (const msg of parsedMsgs) {
        const msgPrio = typePriority.indexOf(msg.type);
        const domPrio = typePriority.indexOf(dominantMsg.type);
        if (msgPrio !== -1 && (domPrio === -1 || msgPrio < domPrio)) {
            dominantMsg = msg;
        }
    }

    result.type = dominantMsg.type;
    result.from = dominantMsg.from;
    result.to = dominantMsg.to;
    result.contractAddress = dominantMsg.contractAddress;

    // Gabungkan amounts dari semua messages yang relevan (hindari duplikat dari approval/allowance)
    for (const msg of parsedMsgs) {
        for (const amt of msg.amounts) {
            // Skip increase_allowance amounts (tidak representasikan transfer nyata)
            result.amounts.push(amt);
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

            if (a.token === 'LP') {
                a.token = `${symbol}-LP`;
            } else {
                a.token = symbol;
            }

            a.amount = (a._sign || 1) * (a.raw / Math.pow(10, decimals));
            delete a.raw;
            delete a._sign;
        });

        // Cleanup native amounts yang masih punya _sign (tidak seharusnya tapi safety)
        tx.amounts.forEach(a => {
            delete a._sign;
            delete a.raw;
        });
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

        // Fetch timestamps (batched, max 30 unique heights)
        const heights = [...new Set(normalized.map(tx => tx.block))].slice(0, 30);
        const heightMap = {};

        await Promise.allSettled(
            heights.map(async (h) => {
                const r = await fetch(`https://mainnet-rpc.paxinet.io/block?height=${h}`, { timeout: 5000 });
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
