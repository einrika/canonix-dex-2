const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

/**
 * Ambil data harga dari API PRC20.
 * Output hanya mengandung array 'prices' dan angka 'price_change'.
 * Jangan sertakan data lain.
 *
 * @param {string} address - PRC20 contract address
 * @returns {Promise<{prices: number[], price_change: number}>}
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

        // Output must contain only 'prices' and 'price_change' as per specification
        return {
            prices: Array.isArray(data.prices) ? data.prices : [],
            price_change: typeof data.price_change === 'number' ? data.price_change : 0
        };
    } catch (error) {
        console.error(`[fetchContractPrices] Error for ${address}:`, error.message);
        throw error;
    }
};

module.exports = { fetchContractPrices };
