const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { address } = event.queryStringParameters || {};

    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(false, null, 'Invalid address provided', 400);
    }

    const cacheKey = `my_assets_${address}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(true, cachedData);

    try {
        // Fetch from Explorer API
        const apiUrl = `https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`;
        const response = await fetch(apiUrl, { timeout: 10000 });

        if (!response.ok) {
            throw new Error(`Explorer API returned ${response.status}`);
        }

        const data = await response.json();

        setCached(cacheKey, data, 60); // Cache for 60 seconds
        return sendResponse(true, data);
    } catch (error) {
        console.error('Error fetching user assets:', error);
        return sendResponse(false, null, 'Failed to fetch user assets', 500);
    }
};
