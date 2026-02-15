const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { query, page = 0, name, type = 'all' } = event.queryStringParameters || {};
    const searchQuery = query || name;

    let apiUrl;
    let cacheKey;

    if (searchQuery) {
        apiUrl = `https://explorer.paxinet.io/api/prc20/search?name=${encodeURIComponent(searchQuery)}`;
        cacheKey = `search_${searchQuery}`;
    } else if (type === 'nonpump') {
        // Use new pumpfun API for non-pump tokens
        apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-tokens?chain=paxi-mainnet`;
        cacheKey = `nonpump_tokens`;
    } else {
        apiUrl = `https://explorer.paxinet.io/api/prc20/contracts?page=${page}`;
        cacheKey = `list_page_${page}`;
    }

    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(true, cachedData);

    try {
        const response = await fetch(apiUrl, { timeout: 10000 });
        if (!response.ok) throw new Error(`API returned ${response.status}`);

        const data = await response.json();

        // Normalize pumpfun response to match explorer format if needed
        if (type === 'nonpump' && data.tokens) {
            // Transform pumpfun tokens to match our processTokenDetail expectations
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
                created_at: t.timestamp // use timestamp as approximation
            }));
        }

        setCached(cacheKey, data, 120);
        return sendResponse(true, data);
    } catch (error) {
        console.error('Error fetching token list:', error);
        return sendResponse(false, null, 'Failed to fetch token list', 500);
    }
};
