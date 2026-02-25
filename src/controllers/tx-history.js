const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress, secureLogger } = require('../utils/common');

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
                secureLogger.warn(`Query ${q} failed:`, e.message);
            }
        }));

        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));

        const normalized = allTxs.map(t => {
            const events = t.tx_result.events || [];

            const result = {
                hash: t.hash,
                type: 'send',
                status: t.tx_result.code === 0 ? 'success' : 'failed',
                timestamp: t.timestamp || null,
                block: t.height,
                gasUsed: t.tx_result.gas_used,
                from: null,
                to: null,
                contractAddress: null,
                amounts: []
            };

            events.forEach(ev => {
                const attrs = {};
                ev.attributes.forEach(attr => {
                    attrs[decodeB64(attr.key)] = decodeB64(attr.value);
                });

                if (ev.type === 'transfer') {
                    if (attrs.sender) result.from = attrs.sender;
                    if (attrs.recipient) result.to = attrs.recipient;

                    if (attrs.amount) {
                        const match = attrs.amount.match(/^(\d+)([a-zA-Z0-9]+)/);
                        if (match) {
                            const raw = parseInt(match[1]);
                            const denom = match[2];
                            const symbol = denom === 'upaxi' ? 'PAXI' : denom.replace(/^u/, '').toUpperCase();
                            const value = raw / 1e6;
                            const sign = attrs.sender === address ? -1 : 1;
                            result.amounts.push({ token: symbol, amount: sign * value });
                        }
                    }
                }

                if (ev.type === 'wasm') {
                    if (attrs._contract_address) result.contractAddress = attrs._contract_address;
                    if (attrs.action) {
                        if (attrs.action.includes('swap')) {
                            result.type = 'swap';
                            const offer = parseInt(attrs.offer_amount || attrs.offerAmount || 0);
                            const ask = parseInt(attrs.return_amount || attrs.askAmount || 0);
                            if (offer) result.amounts.push({ token: (attrs.offer_asset || 'TOKEN').toUpperCase(), amount: -offer / 1e6 });
                            if (ask) result.amounts.push({ token: (attrs.ask_asset || 'PAXI').toUpperCase(), amount: ask / 1e6 });
                        }
                        if (attrs.action.includes('provide_liquidity')) {
                            result.type = 'provide_liquidity';
                            if (attrs.paxiAmount) result.amounts.push({ token: 'PAXI', amount: -(parseInt(attrs.paxiAmount) / 1e6) });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: -(parseInt(attrs.tokenAmount) / 1e6) });
                        }
                        if (attrs.action.includes('withdraw_liquidity')) {
                            result.type = 'withdraw_liquidity';
                            if (attrs.paxiAmount) result.amounts.push({ token: 'PAXI', amount: parseInt(attrs.paxiAmount) / 1e6 });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: parseInt(attrs.tokenAmount) / 1e6 });
                        }
                        if (attrs.action === 'transfer') {
                            result.type = attrs.recipient === address ? 'receive' : 'send';
                            if (attrs.amount) result.amounts.push({ token: 'TOKEN', amount: (attrs.recipient === address ? 1 : -1) * (parseInt(attrs.amount) / 1e6) });
                        }
                    }
                }
            });
            return result;
        });

        const p = parseInt(page);
        const l = parseInt(limit);
        const startIndex = (p - 1) * l;
        const pagedData = normalized.slice(startIndex, startIndex + l);

        return sendResponse(res, true, {
            total_count: normalized.length,
            transactions: pagedData,
            page: p,
            limit: l
        });

    } catch (error) {
        secureLogger.error('History Fetch Error:', error);
        return sendResponse(res, false, null, 'Failed to fetch transaction history', 500);
    }
};

module.exports = txHistoryHandler;
