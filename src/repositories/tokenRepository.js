const supabase = require('../utils/supabase');
const { secureLogger } = require('../utils/common');

class TokenRepository {
    async upsertToken(tokenData) {
        const { data, error } = await supabase
            .from('tokens')
            .upsert({
                address: tokenData.address,
                name: tokenData.name,
                symbol: tokenData.symbol,
                decimals: tokenData.decimals,
                total_supply: tokenData.total_supply,
                logo_url: tokenData.logo_url,
                description: tokenData.description,
                website: tokenData.website,
                official_verified: tokenData.official_verified,
                is_pump: tokenData.is_pump,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error upserting token:', error);
            throw error;
        }
        return data[0];
    }

    async upsertTokenMetadata(address, metadata) {
        const { data, error } = await supabase
            .from('token_metadata')
            .upsert({
                address,
                marketing_address: metadata.marketing_address,
                mintable: metadata.mintable,
                owner_address: metadata.owner_address,
                data: metadata.data,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error upserting token metadata:', error);
            throw error;
        }
        return data[0];
    }

    async saveTokenPrice(priceData) {
        const { data, error } = await supabase
            .from('token_prices')
            .insert({
                address: priceData.address,
                price_paxi: priceData.price_paxi,
                market_cap_paxi: priceData.market_cap_paxi,
                liquidity_paxi: priceData.liquidity_paxi,
                volume_24h: priceData.volume_24h,
                timestamp: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error saving token price:', error);
            throw error;
        }
        return data[0];
    }

    async upsertPriceChanges(address, changes) {
        const { data, error } = await supabase
            .from('token_price_changes')
            .upsert({
                address,
                change_1h: changes.change_1h,
                change_24h: changes.change_24h,
                change_7d: changes.change_7d,
                ath: changes.ath,
                atl: changes.atl,
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            secureLogger.error('Error upserting price changes:', error);
            throw error;
        }
        return data[0];
    }

    async getTokenByAddress(address) {
        const { data, error } = await supabase
            .from('tokens')
            .select('*')
            .eq('address', address)
            .single();

        if (error && error.code !== 'PGRST116') {
            secureLogger.error('Error getting token:', error);
            throw error;
        }
        return data;
    }
}

module.exports = new TokenRepository();
