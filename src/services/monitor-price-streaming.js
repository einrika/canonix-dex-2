const { fetchContractPrices } = require('./monitor-price-get-contract-prices');
const { isValidPaxiAddress } = require('../utils/common');

let ioInstance = null;
let monitorInterval = null;

/**
 * Initialize Price Streaming Monitor
 * @param {Server} io - Socket.io instance
 */
const init = (io) => {
    ioInstance = io;
    console.log('[MonitorPriceStreaming] Realtime Price Feed initialized');
    startMonitoring();
};

/**
 * Main monitoring loop (5s interval)
 */
const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(async () => {
        try {
            const rooms = ioInstance.sockets.adapter.rooms;
            const activeTokens = [];

            // Identify tokens with active subscribers in token rooms
            for (const [roomName, roomData] of rooms) {
                if (roomName.startsWith('token_') && roomData.size > 0) {
                    activeTokens.push(roomName.replace('token_', ''));
                }
            }

            if (activeTokens.length === 0) return;

            // Poll each active token using the PRC20 Price API
            await Promise.all(activeTokens.map(async (address) => {
                if (!isValidPaxiAddress(address)) return;

                try {
                    // Fetch data using the modular price service (Minimal output as requested)
                    const data = await fetchContractPrices(address);

                    if (data.prices && data.prices.length > 0) {
                        const latestPrice = data.prices[data.prices.length - 1];

                        // Construct payload for realtime chart
                        const payload = {
                            type: 'price',
                            source: 'price_feed',
                            address: address,
                            price_paxi: latestPrice,
                            price_change: data.price_change,
                            timestamp: Date.now(),
                            processed: true
                        };

                        // Broadcast using 'price_update'
                        // Frontend socket.js listens for 'price_update' and dispatches 'paxi_price_updated_socket'
                        ioInstance.to(`token_${address}`).emit('price_update', payload);
                    }

                } catch (e) {
                    // Silent fail for individual tokens
                }
            }));

        } catch (e) {
            console.error('[MonitorPriceStreaming] Loop error:', e.message);
        }
    }, 5000); // Consistent 5s interval for realtime chart sync
};

module.exports = { init };
