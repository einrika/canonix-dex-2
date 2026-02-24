const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'] || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(false, null, 'Too many requests', 429);

    const { address } = event.queryStringParameters || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(false, null, 'Invalid address', 400);
    }

    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });

        if (!response.ok) {
            return sendResponse(false, { valid: false }, 'Contract not found');
        }

        const data = await response.json();
        const contract = data.contract;

        if (!contract) return sendResponse(false, { valid: false }, 'Invalid contract data');

        const hasDecimals = contract.decimals !== undefined;
        const hasSupply = contract.total_supply && parseFloat(contract.total_supply) > 0;
        const hasLiquidity = contract.reserve_paxi && parseFloat(contract.reserve_paxi) > 0;

        const priceUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        const priceRes = await fetch(priceUrl, { timeout: 5000 });
        const hasPriceApi = priceRes.ok;

        const isValid = hasDecimals && hasSupply && hasLiquidity && hasPriceApi;

        return sendResponse(isValid, {
            valid: isValid,
            details: { decimals: hasDecimals, supply: hasSupply, liquidity: hasLiquidity, priceApi: hasPriceApi },
            contract: { name: contract.name, symbol: contract.symbol, decimals: contract.decimals }
        }, isValid ? null : 'Token failed validation requirements');

    } catch (error) {
        return sendResponse(false, null, 'Validation process failed', 500);
    }
};
