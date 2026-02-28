const fetch = require('node-fetch');
const { EXPLORER_API } = require('../config/blockchain');

let ioInstance = null;
let monitorInterval = null;

const cache = {
    tokenList: null,
    paxiPrice: null
};

const { EXPLORER_API, COINGECKO_API } = require('../config/blockchain');

const API_ENDPOINTS = {
    TOKEN_LIST: `${EXPLORER_API}/prc20/contracts?page=0`,
    COINGECKO_PAXI: `${COINGECKO_API}/simple/price?ids=paxi-network&vs_currencies=usd`
};

const init = (io) => {
    ioInstance = io;
    console.log('[Monitor] Global Monitor initialized');

    // Emit cached data on new connections if monitor is enabled
    io.on('connection', (socket) => {
        if (cache.tokenList) socket.emit('token_list_update', cache.tokenList);
        if (cache.paxiPrice) socket.emit('paxi_price_usd_update', cache.paxiPrice);
    });

    startMonitoring();
};

const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    // Global monitoring every 10 seconds
    monitorInterval = setInterval(async () => {
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
