const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');
const { fetchContractPrices } = require('../services/monitor-price-get-contract-prices');

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
            // Use the modular service for realtime data (Strictly minimal output)
            const data = await fetchContractPrices(address);

            const prices = data.prices || [];
            const now = Math.floor(Date.now() / 5000) * 5000;

            // Normalize to history format as requested
            const normalized = {
                price_change: data.price_change || 0,
                prices: prices,
                history: prices.map((p, i) => ({
                    timestamp: now - (prices.length - 1 - i) * 5000,
                    price_paxi: p
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
