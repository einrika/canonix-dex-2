// ============================================
// MAIN.JS - Central Entry Point (ES Module)
// ============================================

import { APP_CONFIG } from './core/config.js';
import { fetchPaxiPrice, fetchPoolData } from './core/api.js';
import { PaxiSocket } from './core/socket.js';
import { UIManager } from './ui/manager.js';

// UI Components - Templates
import { HeaderUI } from '../ui/Header/Header.js';
import { TickerUI } from '../ui/Ticker/Ticker.js';
import { FooterUI } from '../ui/Footer/Footer.js';
import { TokenSidebarUI } from '../ui/TokenSidebar/TokenSidebar.js';
import { UnifiedSidebarUI } from '../ui/UnifiedSidebar/UnifiedSidebar.js';
import { MobileNavUI } from '../ui/MobileNav/MobileNav.js';
import { MoreMenuUI } from '../ui/MoreMenu/MoreMenu.js';
import { TokenModalUI } from '../ui/TokenModal/TokenModal.js';
import { ConnectModalUI } from '../ui/ConnectModal/ConnectModal.js';
import { PINSheetUI } from '../ui/PINSheet/PINSheet.js';
import { InternalWalletSheetUI } from '../ui/InternalWalletSheet/InternalWalletSheet.js';
import { SlippageModalUI } from '../ui/SlippageModal/SlippageModal.js';
import { WalletSwitcherUI } from '../ui/WalletSwitcher/WalletSwitcher.js';
import { TxConfirmModalUI } from '../ui/TxConfirmModal/TxConfirmModal.js';
import { TxResultModalUI } from '../ui/TxResultModal/TxResultModal.js';
import { AIModalUI } from '../ui/AIModal/AIModal.js';
import { FAQModalUI } from '../ui/FAQModal/FAQModal.js';
import { ConsoleModalUI } from '../ui/ConsoleModal/ConsoleModal.js';
import { TradeHeaderStatsUI } from '../ui/TradeHeaderStats/TradeHeaderStats.js';
import { PriceChartUI } from '../ui/PriceChart/PriceChart.js';
import { SwapTerminalUI } from '../ui/SwapTerminal/SwapTerminal.js';
import { TradeStatsUI } from '../ui/TradeStats/TradeStats.js';
import { PoolDepthUI } from '../ui/PoolDepth/PoolDepth.js';
import { TokenInfoUI } from '../ui/TokenInfo/TokenInfo.js';
import { AboutTokenUI } from '../ui/AboutToken/AboutToken.js';
import { HoldersTabUI } from '../ui/HoldersTab/HoldersTab.js';
import { LandingHeroUI } from '../ui/LandingHero/LandingHero.js';
import { EventBannerUI } from '../ui/EventBanner/EventBanner.js';
import { MarketRadarUI } from '../ui/MarketRadar/MarketRadar.js';
import { LandingAIScanUI } from '../ui/LandingAIScan/LandingAIScan.js';
import { LandingFeaturesUI } from '../ui/LandingFeatures/LandingFeatures.js';

// UI Components - Logic
import { HeaderLogic } from './Header/Header.js';
import { TickerLogic } from './Ticker/Ticker.js';
import { FooterLogic } from './Footer/Footer.js';
import { TokenSidebarLogic } from './TokenSidebar/TokenSidebar.js';
import { UnifiedSidebarLogic } from './UnifiedSidebar/UnifiedSidebar.js';
import { MobileNavLogic } from './MobileNav/MobileNav.js';
import { MoreMenuLogic } from './MoreMenu/MoreMenu.js';
import { TokenModalLogic } from './TokenModal/TokenModal.js';
import { ConnectModalLogic } from './ConnectModal/ConnectModal.js';
import { PINSheetLogic } from './PINSheet/PINSheet.js';
import { InternalWalletSheetLogic } from './InternalWalletSheet/InternalWalletSheet.js';
import { SlippageModalLogic } from './SlippageModal/SlippageModal.js';
import { WalletSwitcherLogic } from './WalletSwitcher/WalletSwitcher.js';
import { TxConfirmModalLogic } from './TxConfirmModal/TxConfirmModal.js';
import { TxResultModalLogic } from './TxResultModal/TxResultModal.js';
import { AIModalLogic } from './AIModal/AIModal.js';
import { FAQModalLogic } from './FAQModal/FAQModal.js';
import { ConsoleModalLogic } from './ConsoleModal/ConsoleModal.js';
import { TradeHeaderStatsLogic } from './TradeHeaderStats/TradeHeaderStats.js';
import { PriceChartLogic } from './PriceChart/PriceChart.js';
import { SwapTerminalLogic } from './SwapTerminal/SwapTerminal.js';
import { TradeStatsLogic } from './TradeStats/TradeStats.js';
import { PoolDepthLogic } from './PoolDepth/PoolDepth.js';
import { TokenInfoLogic } from './TokenInfo/TokenInfo.js';
import { AboutTokenLogic } from './AboutToken/AboutToken.js';
import { HoldersTabLogic } from './HoldersTab/HoldersTab.js';
import { LandingHeroLogic } from './LandingHero/LandingHero.js';
import { EventBannerLogic } from './EventBanner/EventBanner.js';
import { MarketRadarLogic } from './MarketRadar/MarketRadar.js';
import { LandingAIScanLogic } from './LandingAIScan/LandingAIScan.js';
import { LandingFeaturesLogic } from './LandingFeatures/LandingFeatures.js';

// Business Logic Modules
import { loadTokensOptimized, selectPRC20 } from './modules/market/tokens.js';
import { initLandingPage } from './pages/landing.js';
import { wallets, security, assets } from './wallet-section/wallet-core.js';
import { WalletUI } from './wallet-section/ui-wallet.js';

// Register all components with UIManager
const components = [
    { name: 'Header', ui: HeaderUI, logic: HeaderLogic },
    { name: 'Ticker', ui: TickerUI, logic: TickerLogic },
    { name: 'Footer', ui: FooterUI, logic: FooterLogic },
    { name: 'TokenSidebar', ui: TokenSidebarUI, logic: TokenSidebarLogic },
    { name: 'UnifiedSidebar', ui: UnifiedSidebarUI, logic: UnifiedSidebarLogic },
    { name: 'MobileNav', ui: MobileNavUI, logic: MobileNavLogic },
    { name: 'MoreMenu', ui: MoreMenuUI, logic: MoreMenuLogic },
    { name: 'TokenModal', ui: TokenModalUI, logic: TokenModalLogic },
    { name: 'ConnectModal', ui: ConnectModalUI, logic: ConnectModalLogic },
    { name: 'PINSheet', ui: PINSheetUI, logic: PINSheetLogic },
    { name: 'InternalWalletSheet', ui: InternalWalletSheetUI, logic: InternalWalletSheetLogic },
    { name: 'SlippageModal', ui: SlippageModalUI, logic: SlippageModalLogic },
    { name: 'WalletSwitcher', ui: WalletSwitcherUI, logic: WalletSwitcherLogic },
    { name: 'TxConfirmModal', ui: TxConfirmModalUI, logic: TxConfirmModalLogic },
    { name: 'TxResultModal', ui: TxResultModalUI, logic: TxResultModalLogic },
    { name: 'AIModal', ui: AIModalUI, logic: AIModalLogic },
    { name: 'FAQModal', ui: FAQModalUI, logic: FAQModalLogic },
    { name: 'ConsoleModal', ui: ConsoleModalUI, logic: ConsoleModalLogic },
    { name: 'TradeHeaderStats', ui: TradeHeaderStatsUI, logic: TradeHeaderStatsLogic },
    { name: 'PriceChart', ui: PriceChartUI, logic: PriceChartLogic },
    { name: 'SwapTerminal', ui: SwapTerminalUI, logic: SwapTerminalLogic },
    { name: 'TradeStats', ui: TradeStatsUI, logic: TradeStatsLogic },
    { name: 'PoolDepth', ui: PoolDepthUI, logic: PoolDepthLogic },
    { name: 'TokenInfo', ui: TokenInfoUI, logic: TokenInfoLogic },
    { name: 'AboutToken', ui: AboutTokenUI, logic: AboutTokenLogic },
    { name: 'HoldersTab', ui: HoldersTabUI, logic: HoldersTabLogic },
    { name: 'LandingHero', ui: LandingHeroUI, logic: LandingHeroLogic },
    { name: 'EventBanner', ui: EventBannerUI, logic: EventBannerLogic },
    { name: 'MarketRadar', ui: MarketRadarUI, logic: MarketRadarLogic },
    { name: 'LandingAIScan', ui: LandingAIScanUI, logic: LandingAIScanLogic },
    { name: 'LandingFeatures', ui: LandingFeaturesUI, logic: LandingFeaturesLogic }
];

components.forEach(c => {
    UIManager.registerUI(c.name, c.ui);
    if (c.logic) UIManager.registerLogic(c.name, c.logic);
});

// Initialize App
window.addEventListener('load', async () => {
    console.log('🚀 Canonix Modular System Booting...');

    // 1. Initial Data Fetch
    await fetchPaxiPrice();

    // 2. WebSocket Init
    PaxiSocket.init();

    // 3. Detect Page Type
    const path = window.location.pathname;
    const pageType = (path.includes('trade.html')) ? 'trade' : 'landing';

    // 4. Initialize UI
    UIManager.init(pageType);

    // 5. Page-Specific Post-Init
    if (pageType === 'trade') {
        await handleTradePageInit();
    } else {
        await initLandingPage();
        await handleLandingPageInit();
    }

    console.log(`✅ Canonix ${pageType.toUpperCase()} initialized`);
});

// GLOBAL UI HELPERS (For compatibility and simple triggers)
window.toggleMobileSidebar = function() {
    const sidebar = document.getElementById('tokenSidebar');
    if (!sidebar) return;
    const isOpen = !sidebar.classList.contains('-translate-x-full');

    if (isOpen) {
        sidebar.classList.add('-translate-x-full');
        window.hideSidebarOverlay();
    } else {
        const unifiedSidebar = document.getElementById('unifiedSidebar');
        if (unifiedSidebar) unifiedSidebar.classList.add('translate-x-full');
        sidebar.classList.remove('-translate-x-full');
        window.showSidebarOverlay();
        loadTokensOptimized();
    }
};

window.toggleUnifiedSidebar = function() {
    const sidebar = document.getElementById('unifiedSidebar');
    if (!sidebar) return;
    const isOpen = !sidebar.classList.contains('translate-x-full');

    if (isOpen) {
        sidebar.classList.add('translate-x-full');
        window.hideSidebarOverlay();
    } else {
        const tokenSidebar = document.getElementById('tokenSidebar');
        if (tokenSidebar) tokenSidebar.classList.add('-translate-x-full');
        sidebar.classList.remove('translate-x-full');
        window.showSidebarOverlay();
    }
};

window.toggleMoreMenu = function() {
    const modal = document.getElementById('moreMenuModal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    } else {
        modal.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    }
};

window.closeAllSidebars = function() {
    const tokenSidebar = document.getElementById('tokenSidebar');
    const unifiedSidebar = document.getElementById('unifiedSidebar');
    if (tokenSidebar) tokenSidebar.classList.add('-translate-x-full');
    if (unifiedSidebar) unifiedSidebar.classList.add('translate-x-full');
    window.hideSidebarOverlay();
};

window.showSidebarOverlay = function() {
    if (window.innerWidth < 1024) {
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) overlay.classList.remove('hidden');
    }
};

window.hideSidebarOverlay = function() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) overlay.classList.add('hidden');
};

// Handle resize for responsive sidebars
window.addEventListener('resize', () => {
    const newWidth = window.innerWidth;
    const tokenSidebar = document.getElementById('tokenSidebar');
    if (newWidth >= 1024) {
        if (tokenSidebar) tokenSidebar.classList.remove('-translate-x-full');
        window.hideSidebarOverlay();
    } else {
        if (tokenSidebar) tokenSidebar.classList.add('-translate-x-full');
        window.hideSidebarOverlay();
    }
});

window.checkWalletLock = function() {
    const overlay = document.getElementById('featureLockOverlay');
    if (!overlay) return;

    const active = wallets.getActiveWallet();
    if (active && !active.isWatchOnly && !security.getSessionPin()) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        if (document.getElementById('pinSheet')?.classList.contains('hidden')) {
            if (window.WalletUI && typeof window.WalletUI.unlockActiveWallet === 'function') {
                window.WalletUI.unlockActiveWallet();
            }
        }
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
};

window.updateAppUI = async function() {
    await fetchPaxiPrice();
    if (window.renderSwapTerminal) await window.renderSwapTerminal();
    if (window.WalletUI && window.currentSidebarTab === 'wallet') {
        window.WalletUI.renderDashboard();
    }
};

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        window.updateAppUI();
        if (window.startRealtimeUpdates) window.startRealtimeUpdates();
    }
});

async function handleTradePageInit() {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const lastToken = localStorage.getItem('canonix_last_token');

    await loadTokensOptimized();

    // Auto-connect wallet
    const active = wallets.getActiveWallet();
    if (active) {
        window.wallet = {
            address: active.address,
            name: active.name,
            type: 'internal',
            id: active.id,
            isWatchOnly: !!active.isWatchOnly,
            signer: null
        };
        window.walletType = 'internal';
        window.dispatchEvent(new CustomEvent('paxi_wallet_connected', { detail: { wallet: active } }));

        if (window.renderSwapTerminal) window.renderSwapTerminal();
        assets.fetchUserAssets(active.address);
        if (window.checkWalletLock) window.checkWalletLock();
    }

    const tokenToLoad = tokenParam || lastToken || APP_CONFIG.DEFAULT_TOKEN;
    await selectPRC20(tokenToLoad);

    if (window.setSwapMode) window.setSwapMode('buy');
    if (window.setSidebarTab) window.setSidebarTab('wallet');
}

async function handleLandingPageInit() {
    // Reveal effects logic from original index.html
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active', 'opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-[20px]');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('opacity-0', 'translate-y-[20px]', 'transition-all', 'duration-[800ms]', 'ease-[cubic-bezier(0.4,0,0.2,1)]');
        observer.observe(el);
    });

    // Counter animations
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const target = parseInt(entry.target.dataset.target);
                animateValue(entry.target, 0, target, 2000);
                entry.target.dataset.animated = "true";
            }
        });
    }, observerOptions);

    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
}

function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start).toLocaleString();
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}
