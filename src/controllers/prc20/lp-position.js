const fetch = require('node-fetch');
const { sendResponse, isValidPaxiAddress } = require('../../utils/common');

const lpPositionController = async (req, res) => {
    const { address, token } = req.query;

    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address parameter', 400);
    }

    if (!token || !isValidPaxiAddress(token)) {
        return sendResponse(res, false, null, 'Invalid token parameter', 400);
    }

    try {
        const lcdUrl = process.env.LCD_URL || 'https://mainnet-lcd.paxinet.io';
        const url = `${lcdUrl}/paxi/swap/position/${address}/${token}`;

        const response = await fetch(url, { timeout: 5000 });
        if (!response.ok) {
            if (response.status === 404) {
                return sendResponse(res, true, { position: null });
            }
            throw new Error(`LCD returned ${response.status}`);
        }

        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('LP position fetch error:', error);
        return sendResponse(res, false, null, 'Failed to fetch LP position', 500);
    }
};

module.exports = lpPositionController;
