// ============================================
// SWAP.JS - Token Swap Operations
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { executeSwap } from '../../core/blockchain.js';

export const SwapModule = {
    setMode: function(mode) {
        State.set('tradeType', mode);
    },

    executeTrade: async function() {
        const wallet = State.get('wallet');
        if (!wallet) return;

        const currentToken = State.get('currentToken');
        if (!currentToken) return;

        // Implementation details are now in SwapTerminalLogic
    }
};
