const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../../utils/common');

const lpPositionHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address, token } = req.query || {};

    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid user address provided', 400);
    }

    if (!token || !isValidPaxiAddress(token)) {
        return sendResponse(res, false, null, 'Invalid token address provided', 400);
    }

    try {
        const apiUrl = `https://mainnet-lcd.paxinet.io/paxi/swap/position/${address}/${token}`;
        const response = await fetch(apiUrl, { timeout: 10000 });

        if (!response.ok) {
            if (response.status === 404) {
                 return sendResponse(res, true, { position: { lp_amount: "0" }, expected_paxi: "0", expected_prc20: "0" });
            }
            throw new Error(`LCD API returned ${response.status}`);
        }

        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Error fetching LP position:', error);
        return sendResponse(res, false, null, 'Failed to fetch LP position from blockchain', 500);
    }
};

module.exports = lpPositionHandler;
