const fetch = require('node-fetch');
const { secureLogger } = require('../utils/common');

class PaxiApiService {
    constructor() {
        this.explorerApi = process.env.EXPLORER_API || 'https://explorer.paxinet.io/api';
        this.pumpfunApi = process.env.PUMPFUN_API || 'https://paxi-pumpfun.winsnip.xyz/api';
        this.lcdApi = process.env.PAXI_LCD || 'https://mainnet-lcd.paxinet.io';
    }

    async fetchWithRetry(url, options = {}, retries = 3, backoff = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    if (response.status === 429 && i < retries - 1) {
                        const wait = backoff * Math.pow(2, i);
                        secureLogger.warn(`Rate limited. Waiting ${wait}ms before retry...`);
                        await new Promise(resolve => setTimeout(resolve, wait));
                        continue;
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                const wait = backoff * Math.pow(2, i);
                secureLogger.warn(`Fetch failed (${error.message}). Retrying in ${wait}ms...`);
                await new Promise(resolve => setTimeout(resolve, wait));
            }
        }
    }

    async getTokens(page = 0) {
        try {
            return await this.fetchWithRetry(`${this.explorerApi}/prc20/contracts?page=${page}`);
        } catch (error) {
            secureLogger.error('Error fetching tokens:', error);
            return null;
        }
    }

    async getTokenDetail(address) {
        try {
            return await this.fetchWithRetry(`${this.explorerApi}/prc20/contract?address=${address}`);
        } catch (error) {
            secureLogger.error(`Error fetching token detail for ${address}:`, error);
            return null;
        }
    }

    async getTokenHolders(address, page = 0) {
        try {
            return await this.fetchWithRetry(`${this.explorerApi}/prc20/holders?address=${address}&page=${page}`);
        } catch (error) {
            secureLogger.error(`Error fetching holders for ${address}:`, error);
            return null;
        }
    }

    async getPumpTokens() {
        try {
            return await this.fetchWithRetry(`${this.pumpfunApi}/prc20-tokens?chain=paxi-mainnet`);
        } catch (error) {
            secureLogger.error('Error fetching pump tokens:', error);
            return null;
        }
    }

    async getWalletHoldings(address) {
        try {
            return await this.fetchWithRetry(`${this.explorerApi}/prc20/my_contract_accounts?address=${address}`);
        } catch (error) {
            secureLogger.error(`Error fetching wallet holdings for ${address}:`, error);
            return null;
        }
    }

    async getNativeBalance(address) {
        try {
            return await this.fetchWithRetry(`${this.lcdApi}/cosmos/bank/v1beta1/balances/${address}`);
        } catch (error) {
            secureLogger.error(`Error fetching native balance for ${address}:`, error);
            return null;
        }
    }

    async getPoolDetails(address) {
        try {
            return await this.fetchWithRetry(`${this.lcdApi}/paxi/swap/pool/${address}`);
        } catch (error) {
            secureLogger.error(`Error fetching pool details for ${address}:`, error);
            return null;
        }
    }
}

module.exports = new PaxiApiService();
