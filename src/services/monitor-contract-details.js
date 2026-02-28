const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');
const { EXPLORER_API } = require('../config/blockchain');

let ioInstance = null;
let monitorInterval = null;

/**
 * Fetch contract details from explorer API
 * @param {string} address - PRC20 contract address
 * @returns {Promise<object>} - Contract details
 */
const fetchContractDetails = async (address) => {
    if (!address || !isValidPaxiAddress(address)) {
        throw new Error(`Invalid address provided: ${address}`);
    }

    try {
        const url = `${EXPLORER_API}/prc20/contract?address=${address}`;
        const response = await fetch(url, { timeout: 6000 });

        if (!response.ok) {
            throw new Error(`Explorer API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Explorer API often wraps data in a 'contract' or 'data' field
        const contractInfo = data?.data?.contract || data?.contract || data;

        if (!contractInfo) {
            throw new Error('Contract details not found in API response');
        }

        return contractInfo;
    } catch (error) {
        console.error(`[fetchContractDetails] Error for ${address}:`, error.message);
        throw error;
    }
};

/**
 * Initialize Realtime Monitoring
 * @param {Server} io - Socket.io instance
 */
const init = (io) => {
    ioInstance = io;
    console.log('[MonitorContractDetails] Realtime Token Monitor initialized');
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

            // Identify tokens with active subscribers
            for (const [roomName, roomData] of rooms) {
                if (roomName.startsWith('token_') && roomData.size > 0) {
                    activeTokens.push(roomName.replace('token_', ''));
                }
            }

            if (activeTokens.length === 0) return;

            // Poll each active token using the Explorer API
            await Promise.all(activeTokens.map(async (address) => {
                if (!isValidPaxiAddress(address)) return;

                try {
                    const tokenData = await fetchContractDetails(address);

                    // Format data for chart and UI (Matching tokens.js and chart.js expectations)
                    // Calculate price if not directly provided
                    let pricePaxi = parseFloat(tokenData.price_paxi || tokenData.price || 0);
                    if (pricePaxi === 0 && parseFloat(tokenData.reserve_prc20) > 0) {
                        const decimals = tokenData.decimals || 6;
                        pricePaxi = (parseFloat(tokenData.reserve_paxi) / parseFloat(tokenData.reserve_prc20)) * Math.pow(10, decimals - 6);
                    }

                    const payload = {
                        type: 'contract',
                        source: 'explorer_api',
                        address: address,
                        price_paxi: pricePaxi,
                        price_change: parseFloat(tokenData.price_change || tokenData.price_change_24h || 0),
                        reserve_paxi: parseFloat(tokenData.reserve_paxi || 0),
                        reserve_prc20: parseFloat(tokenData.reserve_prc20 || 0),
                        volume_24h: parseFloat(tokenData.volume || tokenData.volume_24h || 0),
                        holders: parseInt(tokenData.holders || 0),
                        timestamp: Date.now(),
                        processed: true
                    };

                    // Broadcast using 'contract_update' to separate from high-frequency price feed
                    ioInstance.to(`token_${address}`).emit('contract_update', payload);

                } catch (e) {
                    // Fail silently for individual tokens to keep the loop running
                }
            }));

        } catch (e) {
            console.error('[MonitorContractDetails] Loop error:', e.message);
        }
    }, 5000); // 5s interval for realtime updates
};

module.exports = {
    fetchContractDetails,
    init
};
