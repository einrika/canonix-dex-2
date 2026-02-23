// ============================================
// MAIN.JS - Entry Point (ES Module)
// ============================================

import { LandingPage } from './pages/landing.js';
import { TradePage } from './pages/trade.js';

const init = async () => {
    try {
        console.log('[Main] Initializing app...');
        const path = window.location.pathname;

        if (path.includes('trade.html')) {
            await TradePage.init();
        } else {
            await LandingPage.init();
        }
        console.log('[Main] App initialized successfully');
    } catch (e) {
        console.error('[Main] Initialization failed:', e);
        document.body.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;"><h1>Critical Error</h1><pre>${e.stack}</pre></div>`;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
