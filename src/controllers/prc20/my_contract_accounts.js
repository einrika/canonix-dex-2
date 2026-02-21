const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit, isValidPaxiAddress } = require('../../utils/common');

const myContractAccountsHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address } = req.query || {};

    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address provided', 400);
    }

    const cacheKey = `my_assets_${address}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(res, true, cachedData);

    try {
        const apiUrl = `https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`;
        const response = await fetch(apiUrl, { timeout: 10000 });

        if (!response.ok) {
            throw new Error(`Explorer API returned ${response.status}`);
        }

        const data = await response.json();

        setCached(cacheKey, data, 60);
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Error fetching user assets:', error);
        return sendResponse(res, false, null, 'Failed to fetch user assets', 500);
    }
};

module.exports = myContractAccountsHandler;
