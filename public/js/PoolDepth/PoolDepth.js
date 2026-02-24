// ============================================
// POOL DEPTH LOGIC
// ============================================

import { State } from '../core/state.js';
import { formatAmount } from '../core/utils.js';

export const PoolDepthLogic = (container) => {
    const resPaxiEl = container.querySelector('#resPaxi');
    const resTokenEl = container.querySelector('#resToken');
    const labelEl = container.querySelector('#resTokenLabel');

    const updateUI = (poolData) => {
        if (!poolData) return;
        const currentToken = State.get('currentToken');
        if (resPaxiEl) resPaxiEl.textContent = formatAmount(poolData.reserve_paxi / 1e6, 2);
        if (resTokenEl) resTokenEl.textContent = formatAmount(poolData.reserve_prc20 / Math.pow(10, currentToken?.decimals || 6), 2);
        if (labelEl && currentToken) labelEl.textContent = `${currentToken.symbol} STOCK`;
    };

    State.subscribe('poolData', (data) => {
        updateUI(data);
    });

    updateUI(State.get('poolData'));
};
