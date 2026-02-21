const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

const tokenDetailHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address } = req.query || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address', 400);
    }

    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });

        if (!response.ok) {
            return sendResponse(res, false, null, 'Contract not found');
        }

        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Token detail fetch error:', error);
        return sendResponse(res, false, null, 'Failed to fetch contract details', 500);
    }
};

module.exports = tokenDetailHandler;
