const fetch = require('node-fetch');
const { sendResponse, getCached, setCached, checkRateLimit, isValidPaxiAddress } = require('../../utils/common');

const myContractAccountsHandler = async (req, res) => {
    if (req.method === 'OPTIONS') return res.sendStatus(200);

    const ip = req.headers['client-ip'] || req.headers['x-forwarded-for'] || req.ip || 'unknown';
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    const { address } = req.query || {};

    if (!address || !isValidPaxiAddress(address)) {
        return sendResponse(res, false, null, 'Invalid address provided', 400);
    }

    const cacheKey = `my_assets_${address}`;
    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(res, true, cachedData);

    try {
        const apiUrl = `https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`;
        const response = await fetch(apiUrl, { timeout: 10000 });

        if (!response.ok) {
            throw new Error(`Explorer API returned ${response.status}`);
        }

        const data = await response.json();

        // Optimized: Move processing and calculations to backend
        if (data && data.accounts) {
            data.accounts = data.accounts.map(item => {
                const c = item.contract;
                const decimals = c.decimals || 6;
                const totalSupply = parseFloat(c.total_supply || 0) / Math.pow(10, decimals);
                let pricePaxi = 0;
                if (parseFloat(c.reserve_prc20) > 0) {
                    pricePaxi = (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6);
                }
                const marketCapPaxi = totalSupply * pricePaxi;
                const liquidityPaxi = (parseFloat(c.reserve_paxi || 0) * 2) / 1000000;

                return {
                    ...item,
                    contract: {
                        ...c,
                        processed: true,
                        price_paxi: pricePaxi,
                        market_cap: marketCapPaxi,
                        liquidity: liquidityPaxi,
                        total_supply_num: totalSupply
                    }
                };
            });
        }

        setCached(cacheKey, data, 30); // Lower cache for user assets
        return sendResponse(res, true, data);
    } catch (error) {
        console.error('Error fetching user assets:', error);
        return sendResponse(res, false, null, 'Failed to fetch user assets', 500);
    }
};

module.exports = myContractAccountsHandler;
