const tokenRepository = require('../repositories/tokenRepository');
const walletRepository = require('../repositories/walletRepository');
const indexerService = require('../services/indexerService');
const { sendResponse } = require('../utils/common');

const getIndexedTokens = async (req, res) => {
    try {
        const { data, error } = await require('../utils/supabase')
            .from('tokens')
            .select('*, token_price_changes(*)')
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, error.message, 500);
    }
};

const getIndexedTokenDetail = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return sendResponse(res, false, null, 'Address is required', 400);

        const token = await tokenRepository.getTokenByAddress(address);
        if (!token) return sendResponse(res, false, null, 'Token not found', 404);

        const { data: priceHistory } = await require('../utils/supabase')
            .from('token_prices')
            .select('*')
            .eq('address', address)
            .order('timestamp', { ascending: false })
            .limit(100);

        return sendResponse(res, true, { token, priceHistory });
    } catch (error) {
        return sendResponse(res, false, null, error.message, 500);
    }
};

const triggerWalletIndex = async (req, res) => {
    try {
        const { address } = req.query;
        if (!address) return sendResponse(res, false, null, 'Address is required', 400);

        // Run indexing in background
        indexerService.indexWallet(address);

        return sendResponse(res, true, { message: 'Wallet indexing triggered' });
    } catch (error) {
        return sendResponse(res, false, null, error.message, 500);
    }
};

module.exports = {
    getIndexedTokens,
    getIndexedTokenDetail,
    triggerWalletIndex
};
