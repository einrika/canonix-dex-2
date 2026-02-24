// ============================================
// MAIN.JS - Central Entry Point (ES Module)
// ============================================

import { State } from './core/state.js';
import { fetchPaxiPrice, fetchPoolData } from './core/api.js';
import { PaxiSocket } from './core/socket.js';
import { UIManager } from './ui/manager.js';
import { ConsoleSystem } from './ui/console.js';
import { APP_CONFIG } from './core/config.js';
import { TokensModule } from './modules/market/tokens.js';

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

// Register all components
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
    UIManager.register(c.name, c.ui, c.logic);
});

// App Boot
window.addEventListener('load', async () => {
    console.log('🚀 Canonix Modular Booting...');

    // 1. Console System
    ConsoleSystem.init();

    // 2. Initial State
    await fetchPaxiPrice();

    // 3. WebSocket
    PaxiSocket.init();

    // 4. Initialize UI
    const pageType = window.location.pathname.includes('trade.html') ? 'trade' : 'landing';
    UIManager.init(pageType);

    // 5. Load Default Data for Trade Page
    if (pageType === 'trade') {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenAddr = urlParams.get('token') || APP_CONFIG.DEFAULT_TOKEN;
        await TokensModule.selectToken(tokenAddr);
    }

    console.log(`✅ Canonix ${pageType.toUpperCase()} initialized`);
});

// Global Event Bridge
window.addEventListener('paxi_toggle_token_sidebar', () => {
    document.getElementById('tokenSidebar')?.classList.toggle('-translate-x-full');
});
