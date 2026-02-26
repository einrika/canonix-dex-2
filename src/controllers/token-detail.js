const fetch = require('node-fetch');
const { sendResponse, checkRateLimit, isValidPaxiAddress } = require('../utils/common');
const { fetchContractDetails } = require('../services/monitor-contract-details');

const tokenDetailHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address } = req.query || {};
    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address', 400);
    }

    try {
        const c = await fetchContractDetails(address);
        const decimals = c.decimals || 6;
        const totalSupply = parseFloat(c.total_supply || 0) / Math.pow(10, decimals);
        let pricePaxi = 0;
        if (parseFloat(c.reserve_prc20) > 0) {
            pricePaxi = (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6);
        }
        const marketCapPaxi = totalSupply * pricePaxi;
        const liquidityPaxi = (parseFloat(c.reserve_paxi || 0) * 2) / 1000000;

        const processed = {
            contract: {
                ...c,
                processed: true,
                price_paxi: pricePaxi,
                market_cap: marketCapPaxi,
                liquidity: liquidityPaxi,
                total_supply_num: totalSupply
            }
        };

        return sendResponse(res, true, processed);
    } catch (error) {
        console.error('Token detail fetch error:', error);
        return sendResponse(res, false, null, 'Failed to fetch contract details', 500);
    }
};

module.exports = tokenDetailHandler;
