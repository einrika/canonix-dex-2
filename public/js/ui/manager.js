/**
 * UI MANAGER - Central orchestration for Pure JS Rendering (Modular Version)
 * Separates UI (templates) from Logic (scripts)
 */

export const UIManager = {
    uiRegistry: new Map(),
    logicRegistry: new Map(),

    registerUI: function(name, renderFn) {
        this.uiRegistry.set(name, renderFn);
    },

    registerLogic: function(name, logicFn) {
        this.logicRegistry.set(name, logicFn);
    },

    // Legacy support for combined components
    register: function(name, combinedFn) {
        this.registerUI(name, (props) => {
            const result = combinedFn(props);
            return typeof result === 'object' ? result.html : result;
        });
        this.registerLogic(name, (container, props) => {
            const result = combinedFn(props);
            if (typeof result === 'object' && result.postRender) {
                result.postRender(container);
            }
        });
    },

    render: function(name, container, props = {}) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) return null;

        const renderFn = this.uiRegistry.get(name);
        if (!renderFn) {
            console.error(`UI Component "${name}" not registered`);
            return null;
        }

        const html = renderFn(props);
        if (html instanceof HTMLElement) {
            container.innerHTML = '';
            container.appendChild(html);
        } else {
            container.innerHTML = html;
        }

        const logicFn = this.logicRegistry.get(name);
        if (logicFn && typeof logicFn === 'function') {
            logicFn(container, props);
        }

        return container;
    },

    init: function(pageType = 'trade') {
        const app = document.getElementById('app');
        if (!app) return;

        app.innerHTML = ''; // Clear everything

        if (pageType === 'trade') {
            this.renderTradePage(app);
        } else if (pageType === 'landing') {
            this.renderLandingPage(app);
        }
    },

    renderTradePage: function(app) {
        app.className = "bg-bg text-primary-text font-sans h-screen flex flex-col overflow-hidden selection:bg-soft-failed selection:text-primary-text";

        // 1. Header
        const header = document.createElement('header');
        header.id = 'main-header';
        app.appendChild(header);
        this.render('Header', header, { type: 'trade' });

        // 2. Ticker
        const ticker = document.createElement('div');
        ticker.id = 'main-ticker';
        app.appendChild(ticker);
        this.render('Ticker', ticker);

        // 3. Main Content Area (Sidebars + Main)
        const contentArea = document.createElement('div');
        contentArea.className = "flex-1 flex overflow-hidden";
        app.appendChild(contentArea);

        // 3a. Left Sidebar
        const leftSidebar = document.createElement('aside');
        leftSidebar.id = 'tokenSidebar';
        leftSidebar.className = "w-[240px] border-r border-secondary bg-bg flex flex-col lg:static fixed left-0 top-12 bottom-0 z-[110] transition-transform duration-300 -translate-x-full lg:translate-x-0 overflow-hidden";
        contentArea.appendChild(leftSidebar);
        this.render('TokenSidebar', leftSidebar);

        // 3b. Main
        const main = document.createElement('main');
        main.id = 'main-content';
        main.className = "flex-1 overflow-y-auto bg-bg relative no-scrollbar";
        contentArea.appendChild(main);

        // Build Main Content Structure
        this.buildTradeMainLayout(main);

        // 3c. Right Sidebar
        const rightSidebar = document.createElement('aside');
        rightSidebar.id = 'unifiedSidebar';
        rightSidebar.className = "w-[280px] border-l border-secondary bg-bg flex flex-col lg:static fixed right-0 top-12 bottom-0 z-[110] transition-transform duration-300 translate-x-full lg:translate-x-0 overflow-hidden";
        contentArea.appendChild(rightSidebar);
        this.render('UnifiedSidebar', rightSidebar);

        // 4. Mobile Nav
        const mobileNav = document.createElement('div');
        mobileNav.id = 'mobile-nav';
        app.appendChild(mobileNav);
        this.render('MobileNav', mobileNav);

        // 5. Modals Container
        const modals = document.createElement('div');
        modals.id = 'modals-container';
        app.appendChild(modals);

        // Mount individual modals
        const modalList = ['MoreMenu', 'TokenModal', 'ConnectModal', 'PINSheet', 'InternalWalletSheet', 'SlippageModal', 'WalletSwitcher', 'TxConfirmModal', 'TxResultModal', 'AIModal', 'ConsoleModal'];
        modalList.forEach(m => {
            const div = document.createElement('div');
            modals.appendChild(div);
            this.render(m, div);
        });

        // 6. Overlays
        const sidebarOverlay = document.createElement('div');
        sidebarOverlay.id = 'sidebarOverlay';
        sidebarOverlay.className = "hidden fixed inset-0 bg-secondary/80 z-[105] lg:hidden";
        sidebarOverlay.onclick = () => window.closeAllSidebars();
        app.appendChild(sidebarOverlay);

        const sheetOverlay = document.createElement('div');
        sheetOverlay.id = 'sheetOverlay';
        sheetOverlay.className = "hidden fixed inset-0 bg-secondary/60 z-[180] backdrop-blur-sm transition-opacity duration-300";
        sheetOverlay.onclick = () => window.hideInternalWalletSheet();
        app.appendChild(sheetOverlay);

        // 7. Notification Container
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notificationContainer';
        notificationContainer.className = "fixed top-16 right-4 z-[9999] flex flex-col gap-3";
        app.appendChild(notificationContainer);
    },

    buildTradeMainLayout: function(main) {
        // TradeHeaderStats
        const headerStats = document.createElement('div');
        main.appendChild(headerStats);
        this.render('TradeHeaderStats', headerStats);

        // PriceChart
        const chart = document.createElement('div');
        chart.className = "p-2 md:p-3";
        main.appendChild(chart);
        this.render('PriceChart', chart);

        // SwapTerminal
        const swap = document.createElement('div');
        swap.id = 'mainSwapContainer';
        swap.className = "px-2 md:px-3 pb-3 hidden";
        main.appendChild(swap);
        this.render('SwapTerminal', swap);

        // Stats Grid
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-2 md:px-3 pb-3";
        main.appendChild(grid);

        const ts = document.createElement('div');
        grid.appendChild(ts);
        this.render('TradeStats', ts);

        const pd = document.createElement('div');
        grid.appendChild(pd);
        this.render('PoolDepth', pd);

        const ti = document.createElement('div');
        grid.appendChild(ti);
        this.render('TokenInfo', ti);

        // About
        const about = document.createElement('div');
        about.id = 'tokenDetailsCard';
        about.className = "px-3 md:px-4 pb-4 hidden";
        main.appendChild(about);
        this.render('AboutToken', about);

        // Holders
        const holders = document.createElement('div');
        holders.className = "px-2 md:px-3 pb-16";
        main.appendChild(holders);
        this.render('HoldersTab', holders);

        // Overlays inside main
        const featureLock = document.createElement('div');
        featureLock.id = 'featureLockOverlay';
        featureLock.className = "hidden fixed inset-0 bg-secondary/60 z-[9999] backdrop-blur-md";
        main.appendChild(featureLock);

        const txLoader = document.createElement('div');
        txLoader.id = 'txLoader';
        txLoader.className = "hidden fixed inset-0 bg-secondary/90 z-[30000] flex items-center justify-center";
        main.appendChild(txLoader);

        // Loader content
        txLoader.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-minimal"></div>
                <h3 class="text-3xl font-display uppercase italic tracking-tighter text-primary-text animate-glitch leading-none">SENDING...</h3>
                <p class="font-mono text-[8px] text-soft-success font-bold uppercase mt-3 tracking-widest italic">WRITING TO BLOCKS</p>
            </div>
        `;
    },

    renderLandingPage: function(app) {
        app.className = "min-h-screen bg-bg text-primary-text font-sans selection:bg-meme-pink selection:text-primary-text";

        // 1. Ticker
        const ticker = document.createElement('div');
        ticker.id = 'main-ticker';
        app.appendChild(ticker);
        this.render('Ticker', ticker, { type: 'landing' });

        // 2. Nav
        const nav = document.createElement('nav');
        nav.id = 'main-nav';
        nav.className = "border-b-2 border-card bg-bg sticky top-0 z-50 px-4";
        app.appendChild(nav);
        this.render('Header', nav, { type: 'landing' });

        // 3. Main Content
        const main = document.createElement('main');
        app.appendChild(main);

        const hero = document.createElement('div');
        main.appendChild(hero);
        this.render('LandingHero', hero);

        const banner = document.createElement('div');
        main.appendChild(banner);
        this.render('EventBanner', banner);

        const market = document.createElement('div');
        main.appendChild(market);
        this.render('MarketRadar', market);

        const ai = document.createElement('div');
        main.appendChild(ai);
        this.render('LandingAIScan', ai);

        const features = document.createElement('div');
        main.appendChild(features);
        this.render('LandingFeatures', features);

        // 4. Footer
        const footer = document.createElement('footer');
        app.appendChild(footer);
        this.render('Footer', footer);

        // 5. Modals Container
        const modals = document.createElement('div');
        modals.id = 'modals-container';
        app.appendChild(modals);

        const modalList = ['ConnectModal', 'PINSheet', 'AIModal'];
        modalList.forEach(m => {
            const div = document.createElement('div');
            modals.appendChild(div);
            this.render(m, div);
        });
    }
};
