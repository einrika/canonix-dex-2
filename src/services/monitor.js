const fetch = require('node-fetch');

let ioInstance = null;
let monitorInterval = null;

const cache = {
    tokenList: null,
    paxiPrice: null
};

const API_ENDPOINTS = {
    TOKEN_LIST: 'https://explorer.paxinet.io/api/prc20/contracts?page=0',
    COINGECKO_PAXI: 'https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd'
};

const init = (io) => {
    ioInstance = io;
    console.log('[Monitor] WebSocket initialized');

    io.on('connection', (socket) => {
        if (cache.tokenList) socket.emit('token_list_update', cache.tokenList);
        if (cache.paxiPrice) socket.emit('paxi_price_usd_update', cache.paxiPrice);

        socket.on('subscribe_sidebar', () => {
            socket.join('sidebar');
        });

        socket.on('unsubscribe_sidebar', () => {
            socket.leave('sidebar');
        });
    });

    startMonitoring();
};

const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(async () => {
        const connections = await ioInstance.fetchSockets();
        if (connections.length === 0) return;

        try {
            await Promise.all([
                updateTokenList(),
                updateGlobalPaxiPrice()
            ]);
        } catch (e) {
            console.error('[Monitor] Loop error:', e.message);
        }
    }, 10000);
};

const updateTokenList = async () => {
    try {
        const res = await fetch(API_ENDPOINTS.TOKEN_LIST);
        if (!res.ok) return;
        const data = await res.json();
        cache.tokenList = data;
        ioInstance.emit('token_list_update', data);
    } catch (e) { }
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
    } catch (e) { }
};

module.exports = { init };
