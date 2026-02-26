const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

let ioInstance = null;
let monitorInterval = null;

// State to track the last known length of prices array for each token
const lastPricesLength = new Map();

// State to track the absolute last price emitted to prevent duplicate emissions
const lastEmittedPrice = new Map();

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
 * Fetch fast price from swap pool (LCD)
 * Used as a real-time fallback when chart source is delayed.
 */
const fetchPoolPrice = async (address) => {
    try {
        const url = `https://mainnet-lcd.paxinet.io/paxi/swap/pool/${address}`;
        const response = await fetch(url, { timeout: 3000 });
        if (!response.ok) return null;
        const data = await response.json();
        return parseFloat(data.price_paxi_per_prc20 || 0);
    } catch (e) {
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

                // Concurrent fetch: Chart Source (Prices API) and Fast Source (Swap Pool LCD)
                const [data, poolPrice] = await Promise.all([
                    fetchContractPrices(address),
                    fetchPoolPrice(address)
                ]);

                if (!data || !data.prices || data.prices.length === 0) return;

                const currentLength = data.prices.length;
                let prevLength = lastPricesLength.get(address);
                let lastEmitted = lastEmittedPrice.get(address);

                // First fetch initialization
                if (prevLength === undefined) {
                    lastPricesLength.set(address, currentLength);
                    prevLength = currentLength - 1;
                }

                // HYBRID LOGIC:
                // 1. If contract prices array has increased, use the official chart data.
                if (currentLength > prevLength) {
                    let lastP = 0;
                    for (let i = prevLength; i < currentLength; i++) {
                        lastP = data.prices[i];
                        const payload = {
                            type: 'price_realtime',
                            source: 'price_api_realtime',
                            address: address,
                            price_paxi_realtime: lastP,
                            price_change_realtime: data.price_change,
                            index: i
                        };
                        ioInstance.to(`token_${address}`).emit('price_update', payload);
                    }
                    lastPricesLength.set(address, currentLength);
                    lastEmittedPrice.set(address, lastP);
                }
                // 2. Fallback: If array hasn't changed, check swap pool for faster updates.
                else if (poolPrice && poolPrice !== lastEmitted) {
                    // Update the active candle (current last index) with fast pool price
                    const payload = {
                        type: 'price_realtime',
                        source: 'price_pool_fast', // Differentiated source
                        address: address,
                        price_paxi_realtime: poolPrice,
                        price_change_realtime: data.price_change, // Still using official change
                        index: currentLength - 1
                    };
                    ioInstance.to(`token_${address}`).emit('price_update', payload);
                    lastEmittedPrice.set(address, poolPrice);
                }
            }));

        } catch (e) {
            console.error('[PriceMonitor] Loop error:', e.message);
        }
    }, 5000);
};

module.exports = { init, fetchContractPrices };
