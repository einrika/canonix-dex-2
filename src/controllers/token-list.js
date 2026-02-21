const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit } = require('../utils/common');

const tokenListHandler = async (req, res) => {
    // OPTIONS is handled by CORS middleware, but we'll keep the logic if needed
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { query, page = 0, name, type = 'all' } = req.query || {};
    const searchQuery = query || name;

    let apiUrl;
    let cacheKey;

    if (searchQuery) {
        apiUrl = `https://explorer.paxinet.io/api/prc20/search?name=${encodeURIComponent(searchQuery)}`;
        cacheKey = `search_${searchQuery}`;
    } else if (type === 'nonpump') {
        apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-tokens?chain=paxi-mainnet`;
        cacheKey = `nonpump_tokens`;
    } else {
        apiUrl = `https://explorer.paxinet.io/api/prc20/contracts?page=${page}`;
        cacheKey = `list_page_${page}`;
    }

    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(res, true, cachedData);

    try {
        const response = await fetch(apiUrl, { timeout: 10000 });
        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data = await response.json();

        if (type === 'nonpump' && data.tokens) {
            data.contracts = data.tokens.map(t => ({
                contract_address: t.contract_address,
                name: t.token_info.name,
                symbol: t.token_info.symbol,
                decimals: t.token_info.decimals,
                total_supply: t.token_info.total_supply,
                logo: t.marketing_info.logo?.url,
                desc: t.marketing_info.description,
                project: t.marketing_info.project,
                marketing: t.marketing_info.marketing,
                holders: t.num_holders,
                official_verified: t.verified,
                price_change: t.price_change_24h,
                reserve_paxi: t.reserve_paxi,
                reserve_prc20: t.reserve_prc20,
                volume: t.volume_24h,
                buys: t.buys,
                sells: t.sells,
                is_pump: t.is_pump,
                txs_count: t.txs_count,
                created_at: t.timestamp
            }));
        }

        setCached(cacheKey, data, 120);
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Error fetching token list:', error);
        return sendResponse(res, false, null, 'Failed to fetch token list', 500);
    }
};

module.exports = tokenListHandler;
