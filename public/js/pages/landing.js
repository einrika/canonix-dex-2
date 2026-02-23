// ============================================
// LANDING PAGE ORCHESTRATOR (ES Module)
// ============================================

import { Header } from '../components/Header.js';
import { Footer } from '../components/Footer.js';
import { LandingHero } from '../components/LandingHero.js';
import { MarketGrid } from '../components/MarketGrid.js';
import { MarketRadar } from '../components/MarketRadar.js';
import { FAQModal } from '../components/FAQModal.js';
import { ConnectModal } from '../components/ConnectModal.js';
import { PINSheet } from '../components/PINSheet.js';
import { State } from '../core/state.js';
import { fetchPaxiPrice } from '../core/api.js';
import { fetchDirect } from '../core/utils.js';
import { setupGlobalUITriggers } from '../core/ui-triggers.js';

export const LandingPage = {
    init: async () => {
        console.log('🚀 Landing Page Booting...');

        setupGlobalUITriggers();

        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <header id="header-mount" class="bg-bg border-b border-card sticky top-0 z-[100]"></header>
            <main id="main-content">
                <section id="hero-mount"></section>
                <section id="radar-mount" class="max-w-7xl mx-auto px-4 pt-20"></section>
                <section id="market-mount" class="max-w-7xl mx-auto px-4 py-20"></section>
            </main>
            <footer id="footer-mount" class="bg-surface border-t-8 border-card mt-20"></footer>
            <div id="modal-mount"></div>
        `;

        // Render Base Components
        document.getElementById('header-mount').innerHTML = Header.render({ type: 'landing' });
        Header.init(document.getElementById('header-mount'), { type: 'landing' });

        document.getElementById('hero-mount').innerHTML = LandingHero.render();
        LandingHero.init(document.getElementById('hero-mount'));

        document.getElementById('radar-mount').innerHTML = MarketRadar.render();
        MarketRadar.init(document.getElementById('radar-mount'));

        document.getElementById('market-mount').innerHTML = MarketGrid.render();
        MarketGrid.init(document.getElementById('market-mount'));

        document.getElementById('footer-mount').innerHTML = Footer.render();
        Footer.init(document.getElementById('footer-mount'));

        // Modals
        const modalMount = document.getElementById('modal-mount');
        modalMount.innerHTML = `
            ${FAQModal.render()}
            ${ConnectModal.render()}
            ${PINSheet.render()}
        `;
        FAQModal.init(modalMount);
        ConnectModal.init(modalMount);
        PINSheet.init(modalMount);

        // Load initial data
        await fetchPaxiPrice();

        // Load initial token list
        try {
            const data = await fetchDirect('/api/token-list?page=0');
            if (data && data.contracts) {
                const tokens = data.contracts.map(c => ({
                    address: c.contract_address,
                    symbol: c.symbol,
                    logo: c.logo,
                    price_paxi: c.processed ? c.price_paxi : 0,
                    price_change_24h: c.price_change || 0,
                    volume_24h: c.volume || 0,
                    verified: c.official_verified === true
                }));
                State.set('tokenList', tokens);
            }
        } catch (e) {
            console.error('Failed to load initial tokens:', e);
        }
    }
};
