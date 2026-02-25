const supabase = require('../utils/supabase');
const { secureLogger } = require('../utils/common');

class WalletRepository {
    async upsertWallet(walletData) {
        const { data, error } = await supabase
            .from('wallets')
            .upsert({
                address: walletData.address,
                name: walletData.name,
                last_seen: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error upserting wallet:', error);
            throw error;
        }
        return data[0];
    }

    async upsertHolding(holdingData) {
        const { data, error } = await supabase
            .from('wallet_holdings')
            .upsert({
                wallet_address: holdingData.wallet_address,
                token_address: holdingData.token_address,
                balance: holdingData.balance,
                updated_at: new Date().toISOString()
            }, { onConflict: 'wallet_address,token_address' })
            .select();

        if (error) {
            secureLogger.error('Error upserting holding:', error);
            throw error;
        }
        return data[0];
    }

    async getHoldingsByWallet(walletAddress) {
        const { data, error } = await supabase
            .from('wallet_holdings')
            .select(`
                *,
                tokens (*)
            `)
            .eq('wallet_address', walletAddress);

        if (error) {
            secureLogger.error('Error getting holdings:', error);
            throw error;
        }
        return data;
    }
}

module.exports = new WalletRepository();
