const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

let ioInstance = null;
let monitorInterval = null;

// State to track the last known length of prices array for each token
const lastPricesLength = new Map();

/**
 * Fetch price data from PRC20 API
 * Returns ONLY 'prices' array and 'price_change'
 */
const fetchContractPrices = async (address) => {
    if (!address || !isValidPaxiAddress(address)) {
        throw new Error(`Invalid address provided: ${address}`);
    }

    try {
        const url = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        const response = await fetch(url, { timeout: 5000 });

        if (!response.ok) {
            throw new Error(`Price API Error: ${response.status}`);
        }

        const data = await response.json();

        return {
            prices: Array.isArray(data.prices) ? data.prices : [],
            price_change: typeof data.price_change === 'number' ? data.price_change : 0
        };
    } catch (error) {
        // Log sparingly to avoid log bloat
        return null;
    }
};

/**
 * Initialize Unified Price Monitor
 * @param {Server} io - Socket.io instance
 */
const init = (io) => {
    if (ioInstance) {
        console.warn('[PriceMonitor] Already initialized');
        return;
    }
    ioInstance = io;
    console.log('[PriceMonitor] Unified Realtime Price Monitor initialized');
    startMonitoring();
};

/**
 * Main monitoring loop (5s interval)
 * One source of truth, one interval.
 */
const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(async () => {
        try {
            const rooms = ioInstance.sockets.adapter.rooms;
            const activeTokens = [];

            // Identify tokens with active subscribers
            for (const [roomName, roomData] of rooms) {
                if (roomName.startsWith('token_') && roomData.size > 0) {
                    activeTokens.push(roomName.replace('token_', ''));
                }
            }

            if (activeTokens.length === 0) return;

            // Poll each active token
            await Promise.all(activeTokens.map(async (address) => {
                if (!isValidPaxiAddress(address)) return;

                const data = await fetchContractPrices(address);
                if (!data || !data.prices || data.prices.length === 0) return;

                const currentLength = data.prices.length;
                let prevLength = lastPricesLength.get(address);

                // First fetch: just store the length and emit the latest
                if (prevLength === undefined) {
                    lastPricesLength.set(address, currentLength);
                    prevLength = currentLength - 1; // Emit at least the last one
                }

                // RULE: Only update if length increases.
                // Emit for each NEW element in the array to keep frontend index-based chart in sync.
                if (currentLength > prevLength) {
                    for (let i = prevLength; i < currentLength; i++) {
                        const price = data.prices[i];

                        const payload = {
                            type: 'price_realtime',
                            source: 'price_api_realtime',
                            address: address,
                            price_paxi_realtime: price,
                            price_change_realtime: data.price_change,
                            index: i // Include index for reliable chart mapping
                        };

                        // Broadcast to specific token room
                        ioInstance.to(`token_${address}`).emit('price_update', payload);
                    }

                    // Update state
                    lastPricesLength.set(address, currentLength);
                }
            }));

        } catch (e) {
            console.error('[PriceMonitor] Loop error:', e.message);
        }
    }, 5000);
};

module.exports = { init, fetchContractPrices };
