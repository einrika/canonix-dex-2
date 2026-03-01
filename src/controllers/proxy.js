const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('../utils/common');

const WHITELISTED_DOMAINS = [
    'paxinet.io',
    'winsnip.xyz',
    'ipfs.io',
    'mypinata.cloud',
    'paxi.mypinata.cloud',
    'paxi-pumpfun.winsnip.xyz',
    'arweave.net'
];

const proxyHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { url } = req.query || {};
    if (!url) return sendResponse(res, false, null, 'URL required', 400);

    try {
        const parsedUrl = new URL(url);
        const isAllowed = WHITELISTED_DOMAINS.some(domain =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            return sendResponse(res, false, null, 'Domain not whitelisted', 403);
        }
    } catch (e) {
        return sendResponse(res, false, null, 'Invalid URL', 400);
    }

    try {
        const fetchOptions = {
            method: req.method,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Proxy error:', error);
        return sendResponse(res, false, null, 'Proxy request failed', 500);
    }
};

module.exports = proxyHandler;
