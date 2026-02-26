const fetch = require('node-fetch');
const { isValidPaxiAddress } = require('../utils/common');

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
        const url = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
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

module.exports = { fetchContractDetails };
