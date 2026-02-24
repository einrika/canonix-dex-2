// ============================================
// TOKENS.JS - Token List Management
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { fetchDirect } from '../../core/utils.js';
import { processTokenDetail } from '../../core/api.js';

export const TokensModule = {
    state: {
        tokenAddresses: [],
        tokenDetails: new Map(),
        currentSort: 'hot',
        isFetching: false
    },

    loadTokens: async function() {
        if (this.state.isFetching) return;
        this.state.isFetching = true;

        try {
            const url = `${APP_CONFIG.EXPLORER_API}/prc20/contracts?page=0&type=all`;
            const data = await fetchDirect(url);
            if (data?.contracts) {
                this.state.tokenAddresses = data.contracts.map(c => c.contract_address);
                const tokens = data.contracts.map(c => {
                    const detail = processTokenDetail(c.contract_address, c);
                    this.state.tokenDetails.set(c.contract_address, detail);
                    return detail;
                });
                State.set('marketTokens', tokens);
            }
        } catch (e) {
            console.error("Tokens load failed", e);
        } finally {
            this.state.isFetching = false;
        }
    },

    selectToken: async function(address) {
        let detail = this.state.tokenDetails.get(address);
        if (!detail) {
             try {
                 const raw = await fetchDirect(`${APP_CONFIG.EXPLORER_API}/prc20/contract?address=${address}`);
                 detail = processTokenDetail(address, raw);
                 this.state.tokenDetails.set(address, detail);
             } catch (e) {
                 console.error("Failed to fetch token detail", e);
             }
        }
        if (detail) {
            State.set('currentToken', detail);
            try {
                const poolData = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/pool-data?address=${address}`);
                State.set('poolData', poolData);
            } catch (e) {}
        }
    }
};
