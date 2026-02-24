const { sendResponse, getCached, setCached } = require('./utils/common');

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return sendResponse(true);

    const { msgs = 1 } = event.queryStringParameters || {};
    const msgCount = parseInt(msgs);

    const cacheKey = `gas_estimate_${msgCount}`;
    const cached = getCached(cacheKey);
    if (cached) return sendResponse(true, cached);

    // Paxi Network Constants
    const GAS_PRICE = 0.025;
    const BASE_GAS = 500000;
    const ADDITIONAL_MSG_GAS = 300000;

    const baseGasLimit = BASE_GAS + (ADDITIONAL_MSG_GAS * (msgCount - 1));
    const gasLimit = Math.ceil(baseGasLimit * 1.4); // 1.4 safety multiplier as per network standard
    const estimatedFee = Math.ceil(gasLimit * GAS_PRICE);

    const data = {
        gasPrice: GAS_PRICE.toString(),
        gasLimit: gasLimit.toString(),
        estimatedFee: estimatedFee.toString(),
        usdValue: "0.00" // Requires external Oracle for real USD
    };

    setCached(cacheKey, data, 300); // Cache for 5 mins

    return sendResponse(true, data);
};
