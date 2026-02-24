// ============================================
// HOLDERS.JS - Token Holder Analysis
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { fetchDirect, formatAmount, shortenAddress } from '../../core/utils.js';

export const HoldersModule = {
    state: {
        holdersList: [],
        holdersPage: 1,
        isFetchingHolders: false
    },

    loadHolders: async function(isRefresh = true) {
        const token = State.get('currentToken');
        if (!token) return;

        if (isRefresh) this.state.holdersPage = 1;

        try {
            this.state.isFetchingHolders = true;
            const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/holders?address=${token.address}&page=${this.state.holdersPage}`);
            if (data?.holders) {
                const newList = isRefresh ? data.holders : [...this.state.holdersList, ...data.holders];
                this.state.holdersList = newList;
                State.set('holdersList', newList);
            }
        } catch (e) {
            console.error("Holders load failed", e);
        } finally {
            this.state.isFetchingHolders = false;
        }
    },

    loadMore: async function() {
        this.state.holdersPage++;
        await this.loadHolders(false);
    }
};
