const rateLimit = new Map();

/**
 * Simple in-memory rate limiter
 */
const rateLimiter = (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const max = 10; // 10 requests per minute

    if (!rateLimit.has(ip)) {
        rateLimit.set(ip, { count: 1, firstRequest: now });
        return next();
    }

    const data = rateLimit.get(ip);
    if (now - data.firstRequest > windowMs) {
        data.count = 1;
        data.firstRequest = now;
        return next();
    }

    data.count++;
    if (data.count > max) {
        return res.status(429).json({ success: false, message: 'Too many requests, please try again later' });
    }

    next();
};

/**
 * Middleware untuk validasi input request
 */
const validatePurchase = (req, res, next) => {
    const { txHash, tokenId, userAddress, amountPaxi, amountToken } = req.body;

    if (!txHash || !tokenId || !userAddress || !amountPaxi || !amountToken) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields: txHash, tokenId, userAddress, amountPaxi, amountToken'
        });
    }

    // Validasi format address PAXI (simpel)
    if (!userAddress.startsWith('paxi1') || userAddress.length < 40) {
        return res.status(400).json({ success: false, message: 'Invalid PAXI address format' });
    }

    next();
};

const validateToken = (req, res, next) => {
    const { contract_address, name, symbol, price_paxi, hardcap, start_date, end_date, receive_wallet } = req.body;

    if (!contract_address || !name || !symbol || !price_paxi || !hardcap || !start_date || !end_date || !receive_wallet) {
        return res.status(400).json({ success: false, message: 'Missing required token fields' });
    }

    next();
};

module.exports = {
    rateLimiter,
    validatePurchase,
    validateToken
};
