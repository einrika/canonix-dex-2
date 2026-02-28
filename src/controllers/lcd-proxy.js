const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');
const { LCD: LCD_URL } = require('../config/blockchain');

const lcdProxyHandler = async (req, res) => {
    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const path = req.params[0] || '';
    const queryString = new URLSearchParams(req.query).toString();
    const finalUrl = `${LCD_URL}/${path}${queryString ? '?' + queryString : ''}`;

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 15000
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(finalUrl, fetchOptions);

        // Forward status code and content type
        res.status(response.status);
        const contentType = response.headers.get('content-type');
        if (contentType) res.setHeader('content-type', contentType);

        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            return res.json(data);
        } else {
            const data = await response.text();
            return res.send(data);
        }
    } catch (error) {
        console.error(`LCD Proxy error [${finalUrl}]:`, error);
        return res.status(500).json({ success: false, error: 'LCD proxy request failed' });
    }
};

module.exports = lcdProxyHandler;
