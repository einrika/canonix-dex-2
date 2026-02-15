const fetch = require('node-fetch');
const { sendResponse, checkRateLimit } = require('./utils/common');

const WHITELISTED_DOMAINS = [
    'paxinet.io',
    'winsnip.xyz',
    'ipfs.io',
    'mypinata.cloud',
    'paxi.mypinata.cloud',
    'paxi-pumpfun.winsnip.xyz'
];

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { url } = event.queryStringParameters || {};
    if (!url) return sendResponse(false, null, 'URL required', 400);

    // SSRF Protection: Check if URL belongs to whitelisted domains
    try {
        const parsedUrl = new URL(url);
        const isAllowed = WHITELISTED_DOMAINS.some(domain =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );

        if (!isAllowed) {
            return sendResponse(false, null, 'Domain not whitelisted', 403);
        }
    } catch (e) {
        return sendResponse(false, null, 'Invalid URL', 400);
    }

    try {
        const fetchOptions = {
            method: event.httpMethod,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        };

        if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' && event.body) {
            fetchOptions.body = event.body;
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        return sendResponse(true, data);
    } catch (error) {
        console.error('Proxy error:', error);
        return sendResponse(false, null, 'Proxy request failed', 500);
    }
};
