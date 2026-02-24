// ============================================
// LANDING.JS - Landing Page Orchestration
// ============================================

import { State } from '../core/state.js';
import { APP_CONFIG } from '../core/config.js';
import { fetchDirect } from '../core/utils.js';
import { processTokenDetail } from '../core/api.js';

export const LandingPage = {
    state: {
        marketTokens: [],
        marketFilter: 'hot',
        marketPage: 0,
        marketTotalAvailable: 0,
        marketIsFetching: false
    },

    init: async function() {
        await this.loadMarket();
    },

    loadMarket: async function() {
        if (this.state.marketIsFetching) return;
        this.state.marketIsFetching = true;

        try {
            const url = `${APP_CONFIG.EXPLORER_API}/prc20/contracts?page=${this.state.marketPage}&type=all`;
            const data = await fetchDirect(url);

            if (data?.contracts) {
                const newTokens = data.contracts.map(c => processTokenDetail(c.contract_address, c));
                this.state.marketTokens = [...this.state.marketTokens, ...newTokens];
                this.state.marketTotalAvailable = data.total || 0;
                State.set('marketTokens', this.state.marketTokens);
            }
        } catch (e) {
            console.error("Market load failed", e);
        } finally {
            this.state.marketIsFetching = false;
        }
    }
};
