const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');

const gasSimulateHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    if (req.method !== 'POST') {
        return sendResponse(res, false, null, 'Method Not Allowed', 405);
    }

    try {
        const { tx_bytes } = req.body || {};
        if (!tx_bytes) return sendResponse(res, false, null, 'tx_bytes required', 400);

        const lcdUrl = 'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/simulate';
        const response = await fetch(lcdUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_bytes })
        });

        const data = await response.json();

        if (!response.ok) {
            return sendResponse(res, false, data, 'Simulation failed', response.status);
        }

        return sendResponse(res, true, data);

    } catch (error) {
        console.error('Gas Simulation Error:', error);
        return sendResponse(res, false, null, 'Internal server error during simulation', 500);
    }
};

module.exports = gasSimulateHandler;
