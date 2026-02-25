const paxiApiService = require('./paxiApiService');
const tokenRepository = require('../repositories/tokenRepository');
const walletRepository = require('../repositories/walletRepository');
const syncRepository = require('../repositories/syncRepository');
const { secureLogger } = require('../utils/common');

class IndexerService {
    async indexAllTokens() {
        let syncLog = null;
        try {
            syncLog = await syncRepository.startSync('TOKEN_INDEX');
            secureLogger.log('Starting token indexing...');

            // 1. Get standard tokens from Explorer
            const explorerData = await paxiApiService.getTokens(0);
            if (explorerData && explorerData.contracts) {
                for (const contract of explorerData.contracts) {
                    await this.processToken(contract);
                }
            }

            // 2. Get pump tokens
            const pumpData = await paxiApiService.getPumpTokens();
            if (pumpData && pumpData.tokens) {
                for (const token of pumpData.tokens) {
                    await this.processPumpToken(token);
                }
            }

            if (syncLog) {
                await syncRepository.finishSync(syncLog.id, 'success', `Indexed ${explorerData?.contracts?.length || 0} explorer tokens and ${pumpData?.tokens?.length || 0} pump tokens.`);
            }
        } catch (error) {
            secureLogger.error('Token indexing failed:', error);
            if (syncLog) {
                await syncRepository.finishSync(syncLog.id, 'failed', error.message);
            }
        }
    }

    async processToken(c) {
        try {
            const decimals = c.decimals || 6;
            const totalSupply = parseFloat(c.total_supply || 0) / Math.pow(10, decimals);

            let pricePaxi = 0;
            if (parseFloat(c.reserve_prc20) > 0) {
                pricePaxi = (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6);
            }

            const marketCapPaxi = totalSupply * pricePaxi;
            const liquidityPaxi = (parseFloat(c.reserve_paxi || 0) * 2) / 1000000;

            // Upsert Token
            await tokenRepository.upsertToken({
                address: c.contract_address,
                name: c.name,
                symbol: c.symbol,
                decimals: decimals,
                total_supply: c.total_supply,
                logo_url: c.logo,
                description: c.desc,
                website: c.project,
                official_verified: c.official_verified,
                is_pump: c.is_pump || false
            });

            // Save Price
            await tokenRepository.saveTokenPrice({
                address: c.contract_address,
                price_paxi: pricePaxi,
                market_cap_paxi: marketCapPaxi,
                liquidity_paxi: liquidityPaxi,
                volume_24h: c.volume || 0
            });

            // Upsert Price Changes
            await tokenRepository.upsertPriceChanges(c.contract_address, {
                change_24h: c.price_change || 0,
                // These might need more data sources for 1h and 7d
                change_1h: 0,
                change_7d: 0,
                ath: 0,
                atl: 0
            });

        } catch (error) {
            secureLogger.error(`Failed to process token ${c.contract_address}:`, error);
        }
    }

    async processPumpToken(t) {
        try {
            const c = {
                contract_address: t.contract_address,
                name: t.token_info.name,
                symbol: t.token_info.symbol,
                decimals: t.token_info.decimals,
                total_supply: t.token_info.total_supply,
                logo: t.marketing_info.logo?.url,
                desc: t.marketing_info.description,
                project: t.marketing_info.project,
                official_verified: t.verified,
                price_change: t.price_change_24h,
                reserve_paxi: t.reserve_paxi,
                reserve_prc20: t.reserve_prc20,
                volume: t.volume_24h,
                is_pump: true
            };
            await this.processToken(c);

            // Additional metadata for pump tokens
            await tokenRepository.upsertTokenMetadata(t.contract_address, {
                marketing_address: t.marketing_info.marketing,
                mintable: true,
                data: {
                    buys: t.buys,
                    sells: t.sells,
                    txs_count: t.txs_count,
                    created_at: t.timestamp
                }
            });
        } catch (error) {
            secureLogger.error(`Failed to process pump token ${t.contract_address}:`, error);
        }
    }

    async indexWallet(address) {
        let syncLog = null;
        try {
            syncLog = await syncRepository.startSync('WALLET_INDEX');
            secureLogger.log(`Indexing wallet ${address}...`);

            // 1. Upsert Wallet
            await walletRepository.upsertWallet({ address });

            // 2. Get Holdings from Paxi API
            const holdingsData = await paxiApiService.getWalletHoldings(address);
            if (holdingsData && holdingsData.accounts) {
                for (const acc of holdingsData.accounts) {
                    await walletRepository.upsertHolding({
                        wallet_address: address,
                        token_address: acc.contract_address,
                        balance: acc.balance
                    });
                }
            }

            if (syncLog) {
                await syncRepository.finishSync(syncLog.id, 'success', `Indexed ${holdingsData?.accounts?.length || 0} holdings for ${address}.`);
            }
        } catch (error) {
            secureLogger.error(`Wallet indexing failed for ${address}:`, error);
            if (syncLog) {
                await syncRepository.finishSync(syncLog.id, 'failed', error.message);
            }
        }
    }
}

module.exports = new IndexerService();
