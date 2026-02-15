const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('./utils/common');

const decodeB64 = (str) => {
    if (!str) return '';
    try {
        return Buffer.from(str, 'base64').toString();
    } catch (e) {
        return str;
    }
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { address, page = 1, limit = 20 } = event.queryStringParameters || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(false, null, 'Invalid address', 400);
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

        // Perform parallel queries to RPC tx_search
        await Promise.all(queries.map(async (q) => {
            try {
                // Fetching more per query to ensure we have enough for merging and pagination
                const url = `https://mainnet-rpc.paxinet.io/tx_search?query="${encodeURIComponent(q)}"&page=1&per_page=100&order_by="desc"`;
                const res = await fetch(url, { timeout: 8000 });
                if (!res.ok) return;

                const data = await res.json();
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

        // Sort combined results by height descending
        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));

        // Normalization Layer
        const normalized = allTxs.map(t => {
            const events = t.tx_result.events || [];
            const result = {
                hash: t.hash,
                type: 'send', // Default
                status: t.tx_result.code === 0 ? 'success' : 'failed',
                timestamp: t.timestamp || new Date().toISOString(), // RPC might not have timestamp in search, would need block fetch for exact
                amount: '0',
                token: 'PAXI',
                gasUsed: t.tx_result.gas_used,
                block: t.height
            };

            // Parse Events for Detail
            events.forEach(ev => {
                const attrs = {};
                ev.attributes.forEach(attr => {
                    attrs[decodeB64(attr.key)] = decodeB64(attr.value);
                });

                if (ev.type === 'transfer') {
                    if (attrs.recipient === address && attrs.sender !== address) {
                        result.type = 'receive';
                    } else {
                        result.type = 'send';
                    }

                    if (attrs.amount) {
                        const match = attrs.amount.match(/^(\d+)(.*)$/);
                        if (match) {
                            result.amount = (parseInt(match[1]) / 1e6).toString();
                            result.token = match[2] === 'upaxi' ? 'PAXI' : match[2] || 'PAXI';
                        }
                    }
                }

                if (ev.type === 'wasm') {
                    if (attrs.action === 'swap' || attrs.action === 'MsgSwap') {
                        result.type = 'swap';
                        result.amount = (parseInt(attrs.offerAmount || attrs.amount || 0) / 1e6).toString();
                        result.token = attrs.offerDenom === 'upaxi' ? 'PAXI' : 'TOKEN';
                    } else if (attrs.action === 'transfer') {
                        // PRC20 transfer
                        if (attrs.recipient === address) result.type = 'receive';
                        else result.type = 'send';
                        result.amount = (parseInt(attrs.amount || 0) / 1e6).toString();
                        result.token = 'TOKEN';
                    } else if (attrs.action === 'burn') {
                        result.type = 'burn';
                        result.amount = (parseInt(attrs.amount || 0) / 1e6).toString();
                        result.token = 'TOKEN';
                    } else if (attrs.action === 'provide_liquidity' || attrs.action === 'MsgProvideLiquidity') {
                        result.type = 'lp';
                        result.amount = (parseInt(attrs.paxiAmount || 0) / 1e6).toString();
                        result.token = 'PAXI';
                    } else if (attrs.action === 'withdraw_liquidity' || attrs.action === 'MsgWithdrawLiquidity') {
                        result.type = 'lp';
                        result.amount = (parseInt(attrs.lpAmount || 0) / 1e6).toString();
                        result.token = 'LP';
                    }
                }
            });

            return result;
        });

        // Pagination for Normalized Results
        const p = parseInt(page);
        const l = parseInt(limit);
        const startIndex = (p - 1) * l;
        const pagedData = normalized.slice(startIndex, startIndex + l);

        return sendResponse(true, {
            total_count: normalized.length,
            transactions: pagedData,
            page: p,
            limit: l
        });

    } catch (error) {
        console.error('History Fetch Error:', error);
        return sendResponse(false, null, 'Failed to fetch transaction history', 500);
    }
};
