const sidebarConfig = require('../config/token-sidebar');
const blockchainConfig = require('../config/blockchain');
const { sendResponse } = require('../utils/common');

const configHandler = async (req, res) => {
    try {
        // As per user request: send actual endpoints, don't hide them.
        // They are stored on server and fetched when needed.
        const combinedConfig = {
            ...sidebarConfig,
            blockchain: blockchainConfig
        };
        return sendResponse(res, true, combinedConfig);
    } catch (error) {
        console.error('Error fetching config:', error);
        return sendResponse(res, false, null, 'Failed to fetch config', 500);
    }
};

module.exports = configHandler;
