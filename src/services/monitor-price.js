const fetch = require('node-fetch');

let ioInstance = null;
let monitorInterval = null;

const API_ENDPOINT = (address) => `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;

const init = (io) => {
    ioInstance = io;
    console.log('[MonitorPrice] Realtime Chart Monitor initialized');
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
                try {
                    const res = await fetch(API_ENDPOINT(address), { timeout: 4000 });
                    if (!res.ok) return;

                    const result = await res.json();
                    if (!result || !result.data) return;

                    const tokenData = result.data;

                    // Format data for chart and UI
                    // Sending ALL fields to ensure tokens.js listener doesn't break MCAP/LIQ stats
                    const payload = {
                        address: address,
                        price_paxi: parseFloat(tokenData.price_paxi || tokenData.price || 0),
                        price_change: parseFloat(tokenData.price_change_24h || 0),
                        reserve_paxi: parseFloat(tokenData.reserve_paxi || 0),
                        reserve_prc20: parseFloat(tokenData.reserve_prc20 || 0),
                        volume_24h: parseFloat(tokenData.volume_24h || 0),
                        market_cap: parseFloat(tokenData.market_cap || 0),
                        liquidity: parseFloat(tokenData.liquidity || 0),
                        timestamp: Date.now()
                    };

                    // Broadcast to specific token room
                    ioInstance.to(`token_${address}`).emit('paxi_price_updated_socket', payload);
                } catch (e) {
                    // Fail silently for individual tokens
                }
            }));

        } catch (e) {
            console.error('[MonitorPrice] Loop error:', e.message);
        }
    }, 5000); // Consistent 5s interval for realtime monitoring
};

module.exports = { init };
