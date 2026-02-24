// ============================================
// ABOUT TOKEN LOGIC
// ============================================

import { State } from '../core/state.js';

export const AboutTokenLogic = (container) => {
    const descEl = container.querySelector('#tokenDesc');
    const logoEl = container.querySelector('#tokenLogo');

    const updateUI = (token) => {
        if (!token) return;
        if (descEl) descEl.textContent = token.description || 'NO DESCRIPTION AVAILABLE.';
        if (logoEl) {
            if (token.logo) {
                logoEl.innerHTML = `<img src="${token.logo}" class="w-full h-full object-cover">`;
            } else {
                logoEl.innerHTML = `<span class="text-black font-display text-3xl">${token.symbol.charAt(0)}</span>`;
            }
        }
    };

    State.subscribe('currentToken', (token) => {
        updateUI(token);
    });

    updateUI(State.get('currentToken'));
};
