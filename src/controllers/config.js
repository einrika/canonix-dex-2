const config = require('../config/token-sidebar');
const { sendResponse } = require('../utils/common');

const configHandler = async (req, res) => {
    try {
        return sendResponse(res, true, config);
    } catch (error) {
        console.error('Error fetching config:', error);
        return sendResponse(res, false, null, 'Failed to fetch config', 500);
    }
};

module.exports = configHandler;
