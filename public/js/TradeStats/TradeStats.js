// ============================================
// TRADE STATS LOGIC
// ============================================

import { State } from '../core/state.js';
import { formatAmount } from '../core/utils.js';

export const TradeStatsLogic = (container) => {
    const mcapEl = container.querySelector('#mcapVal');
    const liqEl = container.querySelector('#liqVal');
    const volEl = container.querySelector('#volVal');

    const updateUI = (token) => {
        if (!token) return;
        if (mcapEl) mcapEl.textContent = `${formatAmount(token.market_cap)} PAXI`;
        if (liqEl) liqEl.textContent = `${formatAmount(token.liquidity)} PAXI`;
        if (volEl) volEl.textContent = `${formatAmount(token.volume_24h)} PAXI`;
    };

    State.subscribe('currentToken', (token) => {
        updateUI(token);
    });

    updateUI(State.get('currentToken'));
};
