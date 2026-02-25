const fetch = require('node-fetch');

let ioInstance = null;
let monitorInterval = null;

// Cache for immediate data delivery on connect
const cache = {
    tokenList: null,
    paxiPrice: null,
    tokenPrices: new Map(), // address -> data
    tokenHistory: new Map() // address -> { realtime: [], "1h": [], ... }
};

const API_ENDPOINTS = {
    TOKEN_LIST: 'https://explorer.paxinet.io/api/prc20/contracts?page=0',
    LCD: 'https://mainnet-lcd.paxinet.io',
    COINGECKO_PAXI: 'https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd'
};

/**
 * Validates and appends a new price point to the history.
 * Ensures ascending order and prevents duplicates/older data.
 */
const updateTokenHistoryCache = (address, timeframe, newPoints) => {
    if (!cache.tokenHistory.has(address)) {
        cache.tokenHistory.set(address, {});
    }
    const tokenHistory = cache.tokenHistory.get(address);
    if (!tokenHistory[timeframe]) {
        tokenHistory[timeframe] = [];
    }

    const currentHistory = tokenHistory[timeframe];

    newPoints.forEach(point => {
        const lastPoint = currentHistory[currentHistory.length - 1];

        // VALIDATION: Only add if timestamp is strictly newer
        // This prevents "bouncing" back to old price data
        if (!lastPoint || point.timestamp > lastPoint.timestamp) {
            currentHistory.push(point);
        } else if (lastPoint && point.timestamp === lastPoint.timestamp) {
            // If same timestamp, update value (useful for same-second updates)
            lastPoint.price_paxi = point.price_paxi;
        }
    });

    // Keep only last 300 points to prevent memory leak
    if (currentHistory.length > 300) {
        tokenHistory[timeframe] = currentHistory.slice(-300);
    }
};

const init = (io) => {
    ioInstance = io;
    console.log('[Monitor] WebSocket initialized');

    io.on('connection', (socket) => {
        console.log('[Monitor] New client connected:', socket.id);

        // Immediate delivery of global data if available
        if (cache.tokenList) socket.emit('token_list_update', cache.tokenList);
        if (cache.paxiPrice) socket.emit('paxi_price_usd_update', cache.paxiPrice);

        socket.on('subscribe_token', async (tokenAddress) => {
            if (tokenAddress) {
                socket.join(`token_${tokenAddress}`);
                console.log(`[Monitor] Client ${socket.id} subscribed to token: ${tokenAddress}`);

                // Fetch full history upon subscription to ensure client has data
                await fetchTokenPriceHistory(tokenAddress, 'realtime');

                // Immediate delivery of token price if cached
                if (cache.tokenPrices.has(tokenAddress)) {
                    socket.emit('price_update', cache.tokenPrices.get(tokenAddress));
                } else {
                    // Trigger immediate fetch for this token if not cached
                    const data = await fetchTokenPrice(tokenAddress);
                    if (data) socket.emit('price_update', data);
                }
            }
        });

        socket.on('unsubscribe_token', (tokenAddress) => {
            if (tokenAddress) {
                socket.leave(`token_${tokenAddress}`);
                console.log(`[Monitor] Client ${socket.id} unsubscribed from token: ${tokenAddress}`);
            }
        });

        socket.on('disconnect', () => {
            console.log('[Monitor] Client disconnected:', socket.id);
        });
    });

    startMonitoring();
};

const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    console.log('[Monitor] Data monitoring service started');

    // Poll every 3000 seconds (aggressive but single point of entry)
    monitorInterval = setInterval(async () => {
        // Only fetch if there are active connections
        const connections = await ioInstance.fetchSockets();
        if (connections.length === 0) return;

        try {
            await Promise.all([
                updateTokenList(),
                updatePriceData(),
                updateGlobalPaxiPrice()
            ]);
        } catch (e) {
            console.error('[Monitor] Loop error:', e.message);
        }
    }, 5000);
};

const updateTokenList = async () => {
    try {
        const res = await fetch(API_ENDPOINTS.TOKEN_LIST);
        if (!res.ok) return;
        const data = await res.json();

        cache.tokenList = data;
        ioInstance.emit('token_list_update', data);
    } catch (e) {
        console.warn('[Monitor] Failed to fetch token list');
    }
};

const updateGlobalPaxiPrice = async () => {
    try {
        const res = await fetch(API_ENDPOINTS.COINGECKO_PAXI);
        if (!res.ok) return;
        const data = await res.json();
        const price = data['paxi-network']?.usd;
        if (price) {
            const payload = { usd: price };
            cache.paxiPrice = payload;
            ioInstance.emit('paxi_price_usd_update', payload);
        }
    } catch (e) {
        // Silently fail
    }
};

const updatePriceData = async () => {
    // Get all rooms starting with 'token_'
    const rooms = Array.from(ioInstance.sockets.adapter.rooms.keys())
        .filter(room => room.startsWith('token_'));

    for (const room of rooms) {
        const address = room.replace('token_', '');
        const data = await fetchTokenPrice(address);
        if (data) {
            ioInstance.to(room).emit('price_update', data);
        }
    }
};

const fetchTokenPrice = async (address) => {
    try {
        const url = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();

        if (data && data.contract) {
            const payload = {
                address: address,
                price_paxi: data.contract.price_paxi,
                price_change: data.contract.price_change,
                reserve_paxi: data.contract.reserve_paxi,
                reserve_prc20: data.contract.reserve_prc20,
                volume_24h: data.contract.volume
            };
            cache.tokenPrices.set(address, payload);

            // Also update history cache for realtime
            const now = Math.floor(Date.now() / 5000) * 5000;
            updateTokenHistoryCache(address, 'realtime', [{
                timestamp: now,
                price_paxi: parseFloat(payload.price_paxi)
            }]);

            return payload;
        }
    } catch (e) {
        // Silently fail
    }
    return null;
};

const fetchTokenPriceHistory = async (address, timeframe) => {
    try {
        let apiUrl;
        if (timeframe === 'realtime') {
            apiUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        } else {
            apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${timeframe}`;
        }

        let response = await fetch(apiUrl, { timeout: 5000 });

        // Fallback logic from token-price.js
        if (!response.ok) {
            const winscanUrl = `https://winscan.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${timeframe}`;
            response = await fetch(winscanUrl, { timeout: 5000 });
            if (!response.ok) return null;
        }

        const data = await response.json();
        let points = [];

        if (timeframe === 'realtime') {
            const prices = data.prices || [];
            const now = Math.floor(Date.now() / 5000) * 5000;
            points = prices.map((p, i) => ({
                timestamp: now - (prices.length - 1 - i) * 5000,
                price_paxi: parseFloat(p)
            }));
        } else {
            const history = data.price_history || data.history || [];
            points = history.map(item => ({
                timestamp: typeof item.timestamp === 'string' ? new Date(item.timestamp).getTime() : item.timestamp,
                price_paxi: parseFloat(item.price_paxi)
            }));
        }

        // Update local cache with fetched points
        updateTokenHistoryCache(address, timeframe, points);
        return data;
    } catch (error) {
        console.error(`[Monitor] History fetch error (${address}):`, error.message);
        return null;
    }
};

/**
 * Service function to be called by controllers.
 * Always returns the latest stateful history.
 */
const getTokenPriceHistory = async (address, timeframe) => {
    const tokenHistory = cache.tokenHistory.get(address);

    // Check if we need to refresh (e.g. if cache empty)
    const isCacheEmpty = !tokenHistory || !tokenHistory[timeframe] || tokenHistory[timeframe].length === 0;

    if (isCacheEmpty) {
        const rawData = await fetchTokenPriceHistory(address, timeframe);
        if (!rawData) return null;
    }

    const currentHistory = cache.tokenHistory.get(address);
    const tokenPrices = cache.tokenPrices.get(address);

    return {
        success: true,
        history: currentHistory ? currentHistory[timeframe] || [] : [],
        price_change: tokenPrices ? tokenPrices.price_change : 0
    };
};

module.exports = { init, getTokenPriceHistory };
