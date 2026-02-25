// src/utils/common.js

// Standard Response Wrapper for Express
const sendResponse = (res, success, data = null, error = null, statusCode = 200) => {
    const response = { success };

    if (success) {
        response.data = data;
    } else {
        // Support structured blockchain error objects or generic error string
        if (typeof error === 'object' && error !== null) {
            response.error = {
                code: error.code || 'UNKNOWN_ERROR',
                message: error.message || 'An error occurred',
                txHash: error.txHash || data?.hash || null,
                status: error.status || 'failed'
            };
        } else {
            response.error = {
                code: 'ERROR',
                message: error || 'An error occurred'
            };
        }
    }

    return res.status(statusCode).json(response);
};

// Secure Logger (Sanitizes sensitive data)
const secureLogger = {
    sanitize: (obj) => {
        if (!obj || typeof obj !== 'object') return obj;
        const SENSITIVE_KEYS = ['privateKey', 'mnemonic', 'seed', 'token', 'key', 'password', 'secret', 'encryptedData'];

        const sanitized = Array.isArray(obj) ? [...obj] : { ...obj };

        for (let key in sanitized) {
            if (SENSITIVE_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
            } else if (typeof sanitized[key] === 'object') {
                sanitized[key] = secureLogger.sanitize(sanitized[key]);
            }
        }
        return sanitized;
    },
    log: (message, ...args) => {
        const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
        console.log(`[LOG] ${message}`, ...sanitizedArgs);
    },
    error: (message, ...args) => {
        const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
        console.error(`[ERROR] ${message}`, ...sanitizedArgs);
    },
    warn: (message, ...args) => {
        const sanitizedArgs = args.map(arg => secureLogger.sanitize(arg));
        console.warn(`[WARN] ${message}`, ...sanitizedArgs);
    }
};

// Simple In-Memory Cache
const cache = new Map();
const getCached = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

const setCached = (key, value, ttlSeconds = 60) => {
    cache.set(key, {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
};

// Basic Rate Limiting (Memory Based - Per Instance)
const rateLimitMap = new Map();
const checkRateLimit = (ip, limit = 50, windowMs = 60000) => {
    const now = Date.now();
    const userStats = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - userStats.startTime > windowMs) {
        userStats.count = 1;
        userStats.startTime = now;
    } else {
        userStats.count++;
    }

    rateLimitMap.set(ip, userStats);
    return userStats.count <= limit;
};

// Input Validation
const isValidPaxiAddress = (address) => {
    // Paxi addresses (bech32) are typically 44 or 64 characters
    // Regex allows paxi1 prefix + 38 to 85 alphanumeric characters
    return /^paxi1[0-9a-z]{38,85}$/.test(address);
};

// Admin State (Ephemeral but persists while server is running)
let adminState = {
    isFrozen: false,
    blockedAddresses: []
};

const getAdminState = () => adminState;
const updateAdminState = (newState) => {
    adminState = { ...adminState, ...newState };
    return adminState;
};

module.exports = {
    sendResponse,
    secureLogger,
    getCached,
    setCached,
    checkRateLimit,
    isValidPaxiAddress,
    getAdminState,
    updateAdminState
};
