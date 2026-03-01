const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');
const { fetchContractPrices, fetchPoolPrice } = require('../services/price-monitor-service');

const tokenPriceHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address, timeframe = '24h' } = req.query || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address parameter', 400);
    }

    const allowedTFs = ['realtime', '1h', '24h', '7d', '30d'];
    const tf = allowedTFs.includes(timeframe) ? timeframe : '24h';

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        if (tf === 'realtime') {
            // CONCURRENT FETCH for hybrid data
            const [data, poolPrice] = await Promise.all([
                fetchContractPrices(address),
                fetchPoolPrice(address)
            ]);

            if (!data) return sendResponse(res, false, null, 'Failed to fetch realtime prices', 500);

            const prices = [...(data.prices || [])];

            // HYBRID OVERRIDE: If pool price is available, override the latest entry
            // to ensure the REST API response matches the fast WebSocket feed.
            if (prices.length > 0 && poolPrice !== null) {
                prices[prices.length - 1] = poolPrice;
            }

            // Refactor for index-based reference as requested
            // 1 candle = 1 element array. Timestamp is index to prevent "snail" redraws.
            const normalized = {
                type: 'price_realtime',
                source: 'hybrid_rest_api',
                price_change_realtime: data.price_change || 0,
                prices: prices,
                history: prices.map((p, i) => ({
                    timestamp: i, // Use index as time reference
                    price_paxi_realtime: p
                }))
            };

            return sendResponse(res, true, normalized);
        }

        // For historical data
        const apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
        const response = await fetch(apiUrl, { timeout: 5000 });

        if (!response.ok) {
            const winscanUrl = `https://winscan.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
            const fallbackRes = await fetch(winscanUrl, { timeout: 5000 });
            if (!fallbackRes.ok) throw new Error(`Upstream returned ${response.status}`);
            const fallbackData = await fallbackRes.json();

            const normalized = {
                history: fallbackData.price_history || fallbackData.history || []
            };
            return sendResponse(res, true, normalized);
        }

        const data = await response.json();
        const normalized = {
            ...data,
            history: data.price_history || data.history || []
        };

        return sendResponse(res, true, normalized);
    } catch (error) {
        console.error('Price history fetch error:', error);
        return sendResponse(res, false, null, 'Failed to fetch price history', 500);
    }
};

module.exports = tokenPriceHandler;
