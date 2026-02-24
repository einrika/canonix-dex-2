// ============================================
// LIQUIDITY.JS - Liquidity Operations
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { executeAddLPTransaction, executeRemoveLPTransaction, executeBurnTransaction } from '../../core/blockchain.js';

export const LiquidityModule = {
    executeAddLP: async function(paxiAmount, tokenAmount) {
        const currentToken = State.get('currentToken');
        if (!currentToken) return;

        try {
            await executeAddLPTransaction(currentToken.address, paxiAmount, tokenAmount);
        } catch (e) {
            console.error("Add LP failed", e);
        }
    },

    executeRemoveLP: async function(lpAmount) {
        const currentToken = State.get('currentToken');
        if (!currentToken) return;

        try {
            await executeRemoveLPTransaction(currentToken.address, lpAmount);
        } catch (e) {
            console.error("Remove LP failed", e);
        }
    },

    executeBurn: async function(amount) {
        const currentToken = State.get('currentToken');
        if (!currentToken) return;

        try {
            await executeBurnTransaction(currentToken.address, amount);
        } catch (e) {
            console.error("Burn failed", e);
        }
    }
};
