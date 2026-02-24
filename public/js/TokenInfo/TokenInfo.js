// ============================================
// TOKEN INFO LOGIC
// ============================================

import { State } from '../core/state.js';
import { formatAmount, showNotif } from '../core/utils.js';

export const TokenInfoLogic = (container) => {
    const supplyEl = container.querySelector('#totalSupply');
    const holdersEl = container.querySelector('#holderCount');
    const caEl = container.querySelector('#caAddr');
    const minterEl = container.querySelector('#minterStatus');

    const updateUI = (token) => {
        if (!token) return;
        if (supplyEl) supplyEl.textContent = formatAmount(token.supply, 0);
        if (holdersEl) holdersEl.textContent = (token.holders || 0).toLocaleString();
        if (caEl) caEl.textContent = token.address;

        if (minterEl) {
            minterEl.textContent = token.mint_status || 'Locked';
            minterEl.className = `font-display text-base uppercase italic ${token.mint_status === 'Revoked' ? 'text-meme-green' : 'text-meme-pink'}`;
        }
    };

    container.querySelector('#copyCaBtn')?.addEventListener('click', () => {
        const token = State.get('currentToken');
        if (token) {
            navigator.clipboard.writeText(token.address);
            showNotif('Address copied');
        }
    });

    State.subscribe('currentToken', (token) => {
        updateUI(token);
    });

    updateUI(State.get('currentToken'));
};
