// ============================================
// SLIPPAGE MODAL LOGIC
// ============================================

import { State } from '../core/state.js';

export const SlippageModalLogic = (container) => {
    const modal = container.querySelector('#slippageModal');

    container.querySelector('#closeSlippageModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });

    container.querySelectorAll('.slip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            State.set('slippage', parseFloat(btn.dataset.slip));
            modal?.classList.add('hidden');
        });
    });

    container.querySelector('#customSlippage')?.addEventListener('change', (e) => {
        State.set('slippage', parseFloat(e.target.value));
    });
};
