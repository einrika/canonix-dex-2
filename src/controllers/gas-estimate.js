const { sendResponse, getCached, setCached } = require('../utils/common');

const gasEstimateHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const { msgs = 1 } = req.query || {};
    const msgCount = parseInt(msgs);

    const cacheKey = `gas_estimate_${msgCount}`;
    const cached = getCached(cacheKey);
    if (cached) return sendResponse(res, true, cached);

    // Paxi Network Constants
    const GAS_PRICE = 0.05;
    const BASE_GAS = 500000;
    const ADDITIONAL_MSG_GAS = 300000;

    const baseGasLimit = BASE_GAS + (ADDITIONAL_MSG_GAS * (msgCount - 1));
    const gasLimit = Math.ceil(baseGasLimit * 1.4);
    const estimatedFee = Math.ceil(gasLimit * GAS_PRICE);

    const data = {
        gasPrice: GAS_PRICE.toString(),
        gasLimit: gasLimit.toString(),
        estimatedFee: estimatedFee.toString(),
        usdValue: "0.00"
    };

    setCached(cacheKey, data, 300);

    return sendResponse(res, true, data);
};

module.exports = gasEstimateHandler;
