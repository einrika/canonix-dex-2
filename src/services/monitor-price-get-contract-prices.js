const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

/**
 * Fetch contract prices and normalize for history/chart
 * @param {string} address - PRC20 contract address
 * @returns {Promise<object>} - Normalized price data
 */
const fetchContractPrices = async (address) => {
    if (!address || !isValidPaxiAddress(address)) {
        throw new Error(`Invalid address provided: ${address}`);
    }

    try {
        const url = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        const response = await fetch(url, { timeout: 5000 });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        if (!result || !result.data) {
            throw new Error('Invalid response data from price API');
        }

        const data = result.data;
        const prices = data.prices || [];
        const now = Math.floor(Date.now() / 5000) * 5000; // Align to 5s bucket

        const normalized = {
            address: address,
            price_change: data.price_change_24h || 0,
            price_paxi: parseFloat(data.price_paxi || data.price || 0),
            reserve_paxi: parseFloat(data.reserve_paxi || 0),
            reserve_prc20: parseFloat(data.reserve_prc20 || 0),
            volume_24h: parseFloat(data.volume_24h || 0),
            market_cap: parseFloat(data.market_cap || 0),
            liquidity: parseFloat(data.liquidity || 0),
            history: prices.map((p, i) => ({
                timestamp: now - (prices.length - 1 - i) * 5000,
                price_paxi: p
            })),
            raw_data: data // Keep raw data for extended use cases
        };

        return normalized;
    } catch (error) {
        console.error(`[fetchContractPrices] Error for ${address}:`, error.message);
        throw error;
    }
};

module.exports = { fetchContractPrices };
