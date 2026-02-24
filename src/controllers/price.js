const fetch = require('node-fetch');
const { sendResponse, getCached, setCached } = require('../utils/common');

const paxiPriceHandler = async (req, res) => {
    const cacheKey = 'paxi_price_usd';
    const cached = getCached(cacheKey);
    if (cached) return sendResponse(res, true, cached);

    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd");
        if (!response.ok) throw new Error("Failed to fetch PAXI price from CoinGecko");

        const data = await response.json();
        const price = data["paxi-network"]?.usd;

        if (typeof price !== "number") throw new Error("Invalid price data from CoinGecko");

        setCached(cacheKey, price, 30); // Cache for 30 seconds
        return sendResponse(res, true, price);
    } catch (e) {
        console.error('[Price] Error:', e.message);
        // Fallback to a hardcoded price or last known if we had persistent storage
        return sendResponse(res, false, null, e.message, 500);
    }
};

module.exports = { paxiPriceHandler };
