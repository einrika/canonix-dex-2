const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit, isValidPaxiAddress } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { address, timeframe = '24h' } = event.queryStringParameters || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(false, null, 'Invalid address parameter', 400);
    }

    // Support timeframes requested by user
    const allowedTFs = ['realtime', '1h', '24h', '7d', '30d'];
    const tf = allowedTFs.includes(timeframe) ? timeframe : '24h';

    const cacheKey = `price_${address}_${tf}`;

    // Bypass cache for realtime requests
    if (tf !== 'realtime') {
        const cachedData = getCached(cacheKey);
        if (cachedData) return sendResponse(true, cachedData);
    }

    try {
        let apiUrl;
        if (tf === 'realtime') {
            apiUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        } else {
            apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
        }

        const response = await fetch(apiUrl, {
            timeout: 10000,
            headers: tf === 'realtime' ? { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } : {}
        });

        if (!response.ok) {
            // Fallback
            const winscanUrl = `https://winscan.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
            const fallbackRes = await fetch(winscanUrl, { timeout: 5000 });
            if (!fallbackRes.ok) throw new Error(`Upstream returned ${response.status}`);
            const fallbackData = await fallbackRes.json();

            // Normalize
            const normalized = {
                history: fallbackData.price_history || fallbackData.history || []
            };
            if (tf !== 'realtime') setCached(cacheKey, normalized, 60);
            return sendResponse(true, normalized);
        }

        const data = await response.json();

        let normalized;
        if (tf === 'realtime') {
            const prices = data.prices || [];
            const now = Date.now();
            normalized = {
                price_change: data.price_change || 0,
                history: prices.map((p, i) => ({
                    timestamp: now - (prices.length - 1 - i) * 10000, // 10s intervals
                    price_paxi: p
                }))
            };
        } else {
            // Normalize: ensure it has a 'history' array
            normalized = {
                ...data,
                history: data.price_history || data.history || []
            };
        }

        if (tf !== 'realtime') setCached(cacheKey, normalized, 60);
        return sendResponse(true, normalized);
    } catch (error) {
        console.error('Price history fetch error:', error);
        return sendResponse(false, null, 'Failed to fetch price history', 500);
    }
};
