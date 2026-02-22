const fetch = require('node-fetch');

let ioInstance = null;
let monitorInterval = null;

// Cache for immediate data delivery on connect
const cache = {
    tokenList: null,
    paxiPrice: null,
    tokenPrices: new Map() // address -> data
};

const API_ENDPOINTS = {
    TOKEN_LIST: 'https://explorer.paxinet.io/api/prc20/contracts?page=0',
    LCD: 'https://mainnet-lcd.paxinet.io',
    COINGECKO_PAXI: 'https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd'
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

    // Poll frequently for realtime updates
    monitorInterval = setInterval(async () => {
        // Only fetch if there are active connections
        const connections = await ioInstance.fetchSockets();
        if (connections.length === 0) return;

        try {
            // Update prices more frequently than token list
            await updatePriceData();
            await updateGlobalPaxiPrice();

            // Update token list less frequently (every 3rd loop ~ 15s)
            if (!this.loopCount) this.loopCount = 0;
            this.loopCount++;
            if (this.loopCount >= 3) {
                await updateTokenList();
                this.loopCount = 0;
            }
        } catch (e) {
            console.error('[Monitor] Loop error:', e.message);
        }
    }, 5000); // 5 seconds
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
        // Fetch from LCD for absolute realtime accuracy
        const url = `${API_ENDPOINTS.LCD}/paxi/swap/pool/${address}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const poolData = await res.json();

        const pool = poolData.pool || poolData;

        if (pool && pool.reserve_paxi && pool.reserve_prc20) {
            const reservePaxi = parseFloat(pool.reserve_paxi);
            const reservePrc20 = parseFloat(pool.reserve_prc20);

            // We need decimals for accurate price. Use cache or fetch if missing.
            let decimals = 6;
            if (cache.tokenList && cache.tokenList.contracts) {
                const contract = cache.tokenList.contracts.find(c => c.contract_address === address);
                if (contract) decimals = contract.decimals;
            }

            const pricePaxi = (reservePaxi / reservePrc20) * Math.pow(10, decimals - 6);

            const payload = {
                address: address,
                price_paxi: pricePaxi,
                reserve_paxi: reservePaxi,
                reserve_prc20: reservePrc20,
                timestamp: Date.now()
            };

            // Merge with Explorer data for volume/change if available
            try {
                const expUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
                const expRes = await fetch(expUrl);
                if (expRes.ok) {
                    const expData = await expRes.json();
                    if (expData && expData.contract) {
                        payload.price_change = expData.contract.price_change;
                        payload.volume_24h = expData.contract.volume;
                    }
                }
            } catch (e) {}

            cache.tokenPrices.set(address, payload);
            return payload;
        }
    } catch (e) {
        console.warn(`[Monitor] Failed to fetch price for ${address}:`, e.message);
    }
    return null;
};

module.exports = { init };
