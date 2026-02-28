const sidebarConfig = require('../config/token-sidebar');
const blockchainConfig = require('../config/blockchain');
const { sendResponse } = require('../utils/common');

const configHandler = async (req, res) => {
    try {
        const publicBlockchainConfig = {
            ...blockchainConfig,
            // Hide actual URLs and replace with backend proxy paths
            RPC: '/api/rpc',
            LCD: '/api/lcd',
            EXPLORER_API: '/api', // Backend already proxies many Explorer routes via /api/prc20/...
            EXPLORER_URL: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.EXPLORER_URL),

            TESTNET_RPC: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.TESTNET_RPC),
            TESTNET_LCD: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.TESTNET_LCD),
            TESTNET_EXPLORER: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.TESTNET_EXPLORER),

            WINSCAN_API: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.WINSCAN_API),
            PUMPFUN_API: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.PUMPFUN_API),
            PRC20_API: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.PRC20_API),
            COINGECKO_API: '/api/proxy?url=' + encodeURIComponent(blockchainConfig.COINGECKO_API)
        };

        const combinedConfig = {
            ...sidebarConfig,
            blockchain: publicBlockchainConfig
        };
        return sendResponse(res, true, combinedConfig);
    } catch (error) {
        console.error('Error fetching config:', error);
        return sendResponse(res, false, null, 'Failed to fetch config', 500);
    }
};

module.exports = configHandler;
