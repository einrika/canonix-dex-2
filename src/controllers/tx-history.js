const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

const decodeB64 = (str) => {
    if (!str) return '';
    try {
        return Buffer.from(str, 'base64').toString();
    } catch (e) {
        return str;
    }
};

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
            `transfer.sender='${address}'`,
            `transfer.recipient='${address}'`
        ];

        const allTxs = [];
        const seenHashes = new Set();
        let totalCountAcrossQueries = 0;

        await Promise.all(queries.map(async (q) => {
            try {
                const url = `https://mainnet-rpc.paxinet.io/tx_search?query="${encodeURIComponent(q)}"&page=1&per_page=100&order_by="desc"`;
                const resFetch = await fetch(url, { timeout: 8000 });
                if (!resFetch.ok) return;

                const data = await resFetch.json();
                if (data.result && data.result.txs) {
                    totalCountAcrossQueries += parseInt(data.result.total_count || 0);
                    data.result.txs.forEach(tx => {
                        if (!seenHashes.has(tx.hash)) {
                            seenHashes.add(tx.hash);
                            allTxs.push(tx);
                        }
                    });
                }
            } catch (e) {
                console.warn(`Query ${q} failed:`, e.message);
            }
        }));

        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));

        const normalized = allTxs.map(t => {
            const events = t.tx_result.events || [];

            // ── Ekstrak memo dari field tx (protobuf base64) ──────────────────
            // Memo tersimpan di dalam tx body yang di-encode protobuf.
            // Cara paling praktis: decode base64 lalu cari string ASCII yang
            // muncul setelah pola memo di protobuf (field 3 dari TxBody).
            let memo = null;
            try {
                if (t.tx) {
                    const txBytes = Buffer.from(t.tx, 'base64');
                    // Field memo di TxBody adalah field tag 0x1A (field 3, wire type 2)
                    // Kita scan bytes untuk menemukan string yang readable
                    let i = 0;
                    while (i < txBytes.length) {
                        const tag = txBytes[i];
                        // field 3 (memo), wire type 2 (length-delimited) => tag = (3 << 3) | 2 = 0x1A
                        if (tag === 0x1A) {
                            i++;
                            // baca varint panjang
                            let length = 0;
                            let shift = 0;
                            while (i < txBytes.length) {
                                const b = txBytes[i++];
                                length |= (b & 0x7F) << shift;
                                shift += 7;
                                if ((b & 0x80) === 0) break;
                            }
                            if (length > 0 && length < 256 && i + length <= txBytes.length) {
                                const candidate = txBytes.slice(i, i + length).toString('utf8');
                                // Validasi: memo harus printable dan bukan binary garbage
                                if (/^[\x20-\x7E\u00C0-\u024F]+$/.test(candidate)) {
                                    memo = candidate;
                                    break;
                                }
                            }
                            i += length;
                        } else {
                            // Skip field lain berdasarkan wire type
                            const wireType = tag & 0x07;
                            i++;
                            if (wireType === 0) {
                                // varint
                                while (i < txBytes.length && (txBytes[i++] & 0x80) !== 0) {}
                            } else if (wireType === 1) {
                                i += 8;
                            } else if (wireType === 2) {
                                let length = 0;
                                let shift = 0;
                                while (i < txBytes.length) {
                                    const b = txBytes[i++];
                                    length |= (b & 0x7F) << shift;
                                    shift += 7;
                                    if ((b & 0x80) === 0) break;
                                }
                                i += length;
                            } else if (wireType === 5) {
                                i += 4;
                            } else {
                                break; // wire type tidak dikenal, stop
                            }
                        }
                    }
                }
            } catch (e) {
                // Gagal parse memo, biarkan null
            }

            const result = {
                hash: t.hash,
                type: 'unknown',
                status: t.tx_result.code === 0 ? 'success' : 'failed',
                timestamp: t.timestamp || null,
                block: t.height,
                gasUsed: t.tx_result.gas_used,
                memo: memo,
                from: null,
                to: null,
                contractAddress: null,
                amounts: []
            };

            events.forEach(ev => {
                const attrs = {};
                ev.attributes.forEach(attr => {
                    // Support both plain text (RPC) dan base64 (beberapa node)
                    const key = attr.key.includes('=')
                        ? decodeB64(attr.key)
                        : attr.key;
                    const value = attr.value
                        ? (attr.value.includes('=') ? decodeB64(attr.value) : attr.value)
                        : '';
                    attrs[key] = value;
                });

                // ── Native bank transfer ───────────────────────────────────────
                if (ev.type === 'transfer') {
                    if (attrs.sender)    result.from = attrs.sender;
                    if (attrs.recipient) result.to   = attrs.recipient;

                    // FIX #1: update type berdasarkan siapa sender/recipient
                    if (attrs.sender === address)    result.type = 'send';
                    if (attrs.recipient === address)  result.type = 'receive';

                    if (attrs.amount) {
                        const match = attrs.amount.match(/^(\d+)([a-zA-Z0-9]+)/);
                        if (match) {
                            const raw    = parseInt(match[1]);
                            const denom  = match[2];
                            const symbol = denom === 'upaxi' ? 'PAXI' : denom.replace(/^u/, '').toUpperCase();
                            const value  = raw / 1e6;
                            const sign   = attrs.sender === address ? -1 : 1;
                            result.amounts.push({ token: symbol, amount: sign * value });
                        }
                    }
                }

                // ── CosmWasm contract execution ───────────────────────────────
                if (ev.type === 'wasm') {
                    if (attrs._contract_address) result.contractAddress = attrs._contract_address;

                    if (attrs.action) {
                        if (attrs.action.includes('swap')) {
                            result.type = 'swap';
                            const offer = parseInt(attrs.offer_amount || attrs.offerAmount || 0);
                            const ask   = parseInt(attrs.return_amount || attrs.askAmount  || 0);
                            if (offer) result.amounts.push({ token: (attrs.offer_asset || 'TOKEN').toUpperCase(), amount: -offer / 1e6 });
                            if (ask)   result.amounts.push({ token: (attrs.ask_asset   || 'PAXI').toUpperCase(),  amount:  ask   / 1e6 });
                        }

                        if (attrs.action.includes('provide_liquidity')) {
                            result.type = 'provide_liquidity';
                            if (attrs.paxiAmount)  result.amounts.push({ token: 'PAXI',  amount: -(parseInt(attrs.paxiAmount)  / 1e6) });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: -(parseInt(attrs.tokenAmount) / 1e6) });
                        }

                        if (attrs.action.includes('withdraw_liquidity')) {
                            result.type = 'withdraw_liquidity';
                            if (attrs.paxiAmount)  result.amounts.push({ token: 'PAXI',  amount: parseInt(attrs.paxiAmount)  / 1e6 });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: parseInt(attrs.tokenAmount) / 1e6 });
                        }

                        // FIX #2: gunakan attrs.to / attrs.from (bukan attrs.recipient)
                        if (attrs.action === 'transfer') {
                            const wasmTo   = attrs.to   || attrs.recipient;
                            const wasmFrom = attrs.from  || attrs.sender;
                            result.type = wasmTo === address ? 'receive' : 'send';
                            result.from = wasmFrom || result.from;
                            result.to   = wasmTo   || result.to;
                            if (attrs.amount) {
                                result.amounts.push({
                                    token: 'TOKEN',
                                    amount: (wasmTo === address ? 1 : -1) * (parseInt(attrs.amount) / 1e6)
                                });
                            }
                        }
                    }
                }
            });

            // Fallback: jika type masih 'unknown' coba tebak dari from/to
            if (result.type === 'unknown') {
                if (result.from === address) result.type = 'send';
                else if (result.to === address) result.type = 'receive';
                else result.type = 'send'; // default
            }

            return result;
        });

        const p = parseInt(page);
        const l = parseInt(limit);
        const startIndex = (p - 1) * l;
        const pagedData  = normalized.slice(startIndex, startIndex + l);

        return sendResponse(res, true, {
            total_count:  normalized.length,
            transactions: pagedData,
            page:  p,
            limit: l
        });

    } catch (error) {
        console.error('History Fetch Error:', error);
        return sendResponse(res, false, null, 'Failed to fetch transaction history', 500);
    }
};

module.exports = txHistoryHandler;
