const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

let ioInstance = null;
let monitorInterval = null;

const init = (io) => {
    ioInstance = io;
    console.log('[MonitorPrice] Realtime Monitor initialized');
    startMonitoring();
};

const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(async () => {
        try {
            const rooms = ioInstance.sockets.adapter.rooms;
            const activeTokens = [];

            for (const [roomName, roomData] of rooms) {
                if (roomName.startsWith('token_') && roomData.size > 0) {
                    activeTokens.push(roomName.replace('token_', ''));
                }
            }

            if (activeTokens.length === 0) return;

            // Poll each active token
            await Promise.all(activeTokens.map(async (address) => {
                if (!isValidPaxiAddress(address)) return;

                try {
                    // Fetch FULL data for monitoring and dashboard stats
                    const url = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
                    const res = await fetch(url, { timeout: 4000 });
                    if (!res.ok) return;

                    const result = await res.json();
                    if (!result || !result.data) return;

                    const tokenData = result.data;
                    const prices = result.prices || []; // Usually top level in this API?

                    // Determine latest price
                    const latestPrice = parseFloat(tokenData.price_paxi || tokenData.price || (prices.length > 0 ? prices[prices.length - 1] : 0));

                    // Construct payload for frontend listeners (Must match tokens.js and chart.js expectations)
                    const payload = {
                        address: address,
                        price_paxi: latestPrice,
                        price_change: parseFloat(tokenData.price_change_24h || result.price_change || 0),
                        reserve_paxi: parseFloat(tokenData.reserve_paxi || 0),
                        reserve_prc20: parseFloat(tokenData.reserve_prc20 || 0),
                        volume_24h: parseFloat(tokenData.volume_24h || 0),
                        prices: prices,
                        timestamp: Date.now()
                    };

                    // Broadcast using 'price_update' as per socket.js listener
                    ioInstance.to(`token_${address}`).emit('price_update', payload);
                } catch (e) {
                    // Fail silently for individual tokens
                }
            }));

        } catch (e) {
            console.error('[MonitorPrice] Loop error:', e.message);
        }
    }, 5000); // 5s interval for realtime streaming
};

module.exports = { init };
