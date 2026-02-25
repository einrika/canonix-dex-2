const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');

const gasSimulateHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    
    const ip =
        req.headers['client-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.ip ||
        'unknown';
    
    if (!checkRateLimit(ip)) {
        return sendResponse(res, false, null, 'Too many requests', 429);
    }
    
    if (req.method !== 'POST') {
        return sendResponse(res, false, null, 'Method Not Allowed', 405);
    }
    
    try {
        
        let body;
        
        if (typeof req.body === 'string') {
            try {
                body = JSON.parse(req.body);
            } catch (e) {
                return sendResponse(res, false, null, 'Invalid JSON body', 400);
            }
        } else {
            body = req.body;
        }
        
        const tx_bytes = body?.tx_bytes;
        
        if (!tx_bytes) {
            return sendResponse(res, false, null, 'tx_bytes required', 400);
        }
        
        const lcdUrl =
            'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/simulate';
        
        const response = await fetch(lcdUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_bytes })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return sendResponse(
                res,
                false,
                data,
                'Simulation failed',
                response.status
            );
        }
        
        return sendResponse(res, true, data);
        
    } catch (error) {
        console.error('Gas Simulation Error:', error);
        return sendResponse(
            res,
            false,
            null,
            'Internal server error during simulation',
            500
        );
    }
};

module.exports = gasSimulateHandler;