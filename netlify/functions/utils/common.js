// Standard Response Wrapper
const sendResponse = (success, data = null, error = null, statusCode = 200) => {
    const origin = process.env.ALLOWED_ORIGIN || '*';
    return {
        statusCode,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        },
        body: JSON.stringify({
            success,
            data,
            error
        })
    };
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

// Admin State (Ephemeral)
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
    getCached,
    setCached,
    checkRateLimit,
    isValidPaxiAddress,
    getAdminState,
    updateAdminState
};
