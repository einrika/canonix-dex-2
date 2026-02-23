// ============================================
// TRADE PAGE ORCHESTRATOR (ES Module)
// ============================================

import { Header } from '../components/Header.js';
import { MobileNav } from '../components/MobileNav.js';
import { TokenSidebar } from '../components/TokenSidebar.js';
import { PriceChart } from '../components/PriceChart.js';
import { SwapTerminal } from '../components/SwapTerminal.js';
import { UnifiedSidebar } from '../components/UnifiedSidebar.js';
import { Ticker } from '../components/Ticker.js';
import { ConnectModal } from '../components/ConnectModal.js';
import { PINSheet } from '../components/PINSheet.js';
import { FAQModal } from '../components/FAQModal.js';
import { ConsoleModal } from '../components/ConsoleModal.js';
import { MoreMenu } from '../components/MoreMenu.js';
import { SlippageModal } from '../components/SlippageModal.js';
import { TxConfirmModal } from '../components/TxConfirmModal.js';
import { TxResultModal } from '../components/TxResultModal.js';
import { AIModal } from '../components/AIModal.js';

import { State } from '../core/state.js';
import { fetchPaxiPrice, loadWalletData } from '../core/api.js';
import { fetchDirect } from '../core/utils.js';
import { PaxiSocket } from '../core/socket.js';
import { setupGlobalUITriggers } from '../core/ui-triggers.js';

export const TradePage = {
    init: async () => {
        console.log('🚀 Trade Terminal Booting...');

        setupGlobalUITriggers();

        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = `
            <div class="h-screen flex flex-col overflow-hidden bg-bg">
                <div id="ticker-mount"></div>
                <header id="header-mount" class="bg-secondary border-b border-card z-[120]"></header>

                <div class="flex-1 flex overflow-hidden relative">
                    <aside id="sidebar-mount"></aside>
                    <main class="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-20 lg:pb-0">
                        <div id="chart-mount" class="border-b border-card"></div>
                        <div id="swap-mount" class="max-w-md mx-auto w-full p-4 lg:p-6"></div>
                    </main>
                    <aside id="unified-sidebar-mount"></aside>
                </div>

                <nav id="mobile-nav-mount"></nav>
                <div id="sidebarOverlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] hidden"></div>
            </div>
            <div id="modal-mount"></div>
        `;

        // Render Components
        document.getElementById('ticker-mount').innerHTML = Ticker.render();
        Ticker.init(document.getElementById('ticker-mount'));

        document.getElementById('header-mount').innerHTML = Header.render({ type: 'trade' });
        Header.init(document.getElementById('header-mount'), { type: 'trade' });

        document.getElementById('sidebar-mount').innerHTML = TokenSidebar.render();
        TokenSidebar.init(document.getElementById('sidebar-mount'));

        document.getElementById('chart-mount').innerHTML = PriceChart.render();
        PriceChart.init(document.getElementById('chart-mount'));

        document.getElementById('swap-mount').innerHTML = SwapTerminal.render();
        SwapTerminal.init(document.getElementById('swap-mount'));

        document.getElementById('unified-sidebar-mount').innerHTML = UnifiedSidebar.render();
        UnifiedSidebar.init(document.getElementById('unified-sidebar-mount'));

        document.getElementById('mobile-nav-mount').innerHTML = MobileNav.render();
        MobileNav.init(document.getElementById('mobile-nav-mount'));

        // Modals
        const modalMount = document.getElementById('modal-mount');
        modalMount.innerHTML = `
            ${ConnectModal.render()}
            ${PINSheet.render()}
            ${FAQModal.render()}
            ${ConsoleModal.render()}
            ${MoreMenu.render()}
            ${SlippageModal.render()}
            ${TxConfirmModal.render()}
            ${TxResultModal.render()}
            ${AIModal.render()}
        `;
        ConnectModal.init(modalMount);
        PINSheet.init(modalMount);
        FAQModal.init(modalMount);
        ConsoleModal.init(modalMount);
        MoreMenu.init(modalMount);
        SlippageModal.init(modalMount);
        TxConfirmModal.init(modalMount);
        TxResultModal.init(modalMount);
        AIModal.init(modalMount);

        // Initialize WebSocket
        PaxiSocket.init();

        // Load initial data
        await fetchPaxiPrice();

        // Load tokens for sidebar
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
        } catch (e) {}

        // Check for connected wallet in storage
        const savedAddr = localStorage.getItem('paxi_wallet_address');
        if (savedAddr) {
            await loadWalletData(savedAddr);
        }
    }
};
