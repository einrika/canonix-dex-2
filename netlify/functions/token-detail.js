const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { address } = event.queryStringParameters || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(false, null, 'Invalid address', 400);
    }

    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });

        if (!response.ok) {
            return sendResponse(false, null, 'Contract not found');
        }

        const data = await response.json();
        return sendResponse(true, data);
    } catch (error) {
        console.error('Token detail fetch error:', error);
        return sendResponse(false, null, 'Failed to fetch contract details', 500);
    }
};
