const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit, isValidPaxiAddress } = require('../../utils/common');

const holdersHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { contract_address, page = 0 } = req.query || {};

    if (!contract_address || !isValidPaxiAddress(contract_address)) {
        return sendResponse(res, false, null, 'Invalid contract address', 400);
    }

    const cacheKey = `holders_${contract_address}_p${page}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(res, true, cachedData);

    try {
        const apiUrl = `https://explorer.paxinet.io/api/prc20/holders?contract_address=${contract_address}&page=${page}`;
        const response = await fetch(apiUrl, { timeout: 10000 });

        if (!response.ok) {
            throw new Error(`Explorer API returned ${response.status}`);
        }

        const data = await response.json();

        setCached(cacheKey, data, 120); // Holders can be cached longer
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Error fetching holders:', error);
        return sendResponse(res, false, null, 'Failed to fetch holders list', 500);
    }
};

module.exports = holdersHandler;
