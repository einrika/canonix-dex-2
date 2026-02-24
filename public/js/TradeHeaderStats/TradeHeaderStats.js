// ============================================
// TRADE HEADER STATS LOGIC
// ============================================

import { State } from '../core/state.js';
import { formatPrice } from '../core/utils.js';

export const TradeHeaderStatsLogic = (container) => {
    const pairEl = container.querySelector('#selectedPair');
    const priceEl = container.querySelector('#currentPrice');
    const changeEl = container.querySelector('#priceChange');

    const updateUI = (token) => {
        if (!token) return;
        if (pairEl) pairEl.textContent = `${token.symbol}/PAXI`;
        if (priceEl) priceEl.textContent = `${formatPrice(token.price_paxi)} PAXI`;

        if (changeEl) {
            const val = (token.price_change_24h * 100);
            changeEl.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(2)}%`;
            changeEl.className = `px-2 py-0.5 rounded font-mono text-[10px] font-bold ${val >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-white'}`;
        }
    };

    container.querySelector('#aiBtn')?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_show_ai_modal'));
    });

    State.subscribe('currentToken', (token) => {
        updateUI(token);
    });

    updateUI(State.get('currentToken'));
};
