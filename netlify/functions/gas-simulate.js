const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    if (event.httpMethod !== 'POST') {
        return sendResponse(false, null, 'Method Not Allowed', 405);
    }

    try {
        const { tx_bytes } = JSON.parse(event.body);
        if (!tx_bytes) return sendResponse(false, null, 'tx_bytes required', 400);

        const lcdUrl = 'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/simulate';
        const response = await fetch(lcdUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_bytes })
        });

        const data = await response.json();

        if (!response.ok) {
            return sendResponse(false, data, 'Simulation failed', response.status);
        }

        // Return raw simulation data, frontend will apply buffer
        return sendResponse(true, data);

    } catch (error) {
        console.error('Gas Simulation Error:', error);
        return sendResponse(false, null, 'Internal server error during simulation', 500);
    }
};
