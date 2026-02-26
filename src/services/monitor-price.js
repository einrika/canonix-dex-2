const { fetchContractPrices } = require('./monitor-price-get-contract-prices');

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
                try {
                    // Fetch data using the modular service
                    const data = await fetchContractPrices(address);

                    // Determine latest price from the prices array
                    const latestPrice = data.prices.length > 0 ? data.prices[data.prices.length - 1] : 0;

                    // Construct payload for frontend listeners
                    const payload = {
                        address: address,
                        price_paxi: latestPrice,
                        price_change: data.price_change,
                        prices: data.prices,
                        timestamp: Date.now()
                    };

                    // Broadcast using the correct event name 'price_update'
                    // Frontend socket.js listens for 'price_update' and dispatches 'paxi_price_updated_socket'
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
