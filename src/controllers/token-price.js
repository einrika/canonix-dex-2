const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');
const { getTokenPriceHistory } = require('../services/monitor');

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

    // Disable caching on the edge/browser
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    try {
        // Redirect to monitor service for stateful, validated history
        const result = await getTokenPriceHistory(address, tf);

        if (!result) {
            return sendResponse(res, false, null, 'Failed to retrieve price history', 500);
        }

        // Return the consistent structure expected by the frontend
        return sendResponse(res, true, {
            history: result.history,
            price_change: result.price_change
        });

    } catch (error) {
        console.error('[Controller] Price history error:', error);
        return sendResponse(res, false, null, 'Internal server error', 500);
    }
};

module.exports = tokenPriceHandler;
