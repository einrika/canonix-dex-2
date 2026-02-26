const { fetchContractPrices } = require('./monitor-price-get-contract-prices');

let ioInstance = null;
let monitorInterval = null;

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
                    const data = await fetchContractPrices(address);

                    // Broadcast to specific token room
                    // Note: fetchContractPrices already returns the correctly formatted payload
                    ioInstance.to(`token_${address}`).emit('paxi_price_updated_socket', data);
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
