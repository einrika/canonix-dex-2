// ============================================
// SETTINGS PAGE LOGIC
// ============================================

import { State } from '../core/state.js';

export const SettingsPageLogic = (container) => {
    const slippageInput = container.querySelector('#default-slippage');

    slippageInput?.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        State.set('slippage', val);
        localStorage.setItem('paxi_default_slippage', val);
    });

    const themeSelect = container.querySelector('#theme-select');
    themeSelect?.addEventListener('change', (e) => {
        const theme = e.target.value;
        State.set('theme', theme);
        localStorage.setItem('paxi_theme', theme);
        // Apply theme logic
    });
};
