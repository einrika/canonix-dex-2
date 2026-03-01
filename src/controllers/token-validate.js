const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');

const tokenValidateHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address } = req.query || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address', 400);
    }

    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });

        if (!response.ok) {
            return sendResponse(res, false, { valid: false }, 'Contract not found');
        }

        const data = await response.json();
        const contract = data.contract;

        if (!contract) return sendResponse(res, false, { valid: false }, 'Invalid contract data');

        const hasDecimals = contract.decimals !== undefined;
        const hasSupply = contract.total_supply && parseFloat(contract.total_supply) > 0;
        const hasLiquidity = contract.reserve_paxi && parseFloat(contract.reserve_paxi) > 0;

        const priceUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        const priceRes = await fetch(priceUrl, { timeout: 5000 });
        const hasPriceApi = priceRes.ok;

        const isValid = hasDecimals && hasSupply && hasLiquidity && hasPriceApi;

        return sendResponse(res, isValid, {
            valid: isValid,
            details: { decimals: hasDecimals, supply: hasSupply, liquidity: hasLiquidity, priceApi: hasPriceApi },
            contract: { name: contract.name, symbol: contract.symbol, decimals: contract.decimals }
        }, isValid ? null : 'Token failed validation requirements');

    } catch (error) {
        return sendResponse(res, false, null, 'Validation process failed', 500);
    }
};

module.exports = tokenValidateHandler;
