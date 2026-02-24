// ============================================
// UIMANAGER.JS - Modular UI Orchestrator
// ============================================

export const UIManager = {
    uiRegistry: {},
    logicRegistry: {},

    register: function(name, uiFn, logicFn) {
        this.uiRegistry[name] = uiFn;
        if (logicFn) this.logicRegistry[name] = logicFn;
    },

    render: function(name, container, props = {}) {
        if (!container) return;
        const uiFn = this.uiRegistry[name];
        if (uiFn) {
            container.innerHTML = uiFn(props);
            const logicFn = this.logicRegistry[name];
            if (logicFn) logicFn(container, props);
        }
    },

    init: function(pageType = 'trade') {
        const app = document.getElementById('app');
        if (!app) return;
        app.innerHTML = '';
        if (pageType === 'trade') this.renderTradePage(app);
        else this.renderLandingPage(app);
    },

    renderLandingPage: function(app) {
        const header = app.appendChild(document.createElement('header'));
        this.render('Header', header, { type: 'landing' });

        const main = app.appendChild(document.createElement('main'));
        this.render('Ticker', main.appendChild(document.createElement('div')));
        this.render('LandingHero', main.appendChild(document.createElement('div')));
        this.render('EventBanner', main.appendChild(document.createElement('div')));
        this.render('MarketRadar', main.appendChild(document.createElement('div')));
        this.render('LandingAIScan', main.appendChild(document.createElement('div')));
        this.render('LandingFeatures', main.appendChild(document.createElement('div')));

        const footer = app.appendChild(document.createElement('footer'));
        this.render('Footer', footer);

        this.renderModals(app, ['ConnectModal', 'PINSheet', 'AIModal', 'FAQModal', 'TokenModal']);
    },

    renderTradePage: function(app) {
        const header = app.appendChild(document.createElement('header'));
        this.render('Header', header, { type: 'trade' });

        this.render('Ticker', app.appendChild(document.createElement('div')));

        const main = app.appendChild(document.createElement('main'));
        main.className = 'flex flex-1 overflow-hidden relative';

        const tokenSidebar = main.appendChild(document.createElement('aside'));
        tokenSidebar.id = 'tokenSidebar';
        tokenSidebar.className = 'w-[280px] border-r-2 border-black bg-bg flex flex-col lg:static fixed left-0 top-14 bottom-0 z-[110] transition-transform duration-300 -translate-x-full lg:translate-x-0 overflow-hidden';
        this.render('TokenSidebar', tokenSidebar);

        const content = main.appendChild(document.createElement('div'));
        content.className = 'flex-1 overflow-y-auto bg-bg relative no-scrollbar';

        this.render('TradeHeaderStats', content.appendChild(document.createElement('div')));
        this.render('PriceChart', content.appendChild(document.createElement('div')));
        this.render('SwapTerminal', content.appendChild(document.createElement('div')));

        const statsGrid = content.appendChild(document.createElement('div'));
        statsGrid.className = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-3 md:px-4 pb-4';
        this.render('TradeStats', statsGrid.appendChild(document.createElement('div')));
        this.render('PoolDepth', statsGrid.appendChild(document.createElement('div')));
        this.render('TokenInfo', statsGrid.appendChild(document.createElement('div')));

        this.render('AboutToken', content.appendChild(document.createElement('div')));
        this.render('HoldersTab', content.appendChild(document.createElement('div')));

        const unifiedSidebar = main.appendChild(document.createElement('aside'));
        unifiedSidebar.id = 'unifiedSidebar';
        unifiedSidebar.className = 'w-[320px] border-l-2 border-black bg-bg flex flex-col lg:static fixed right-0 top-14 bottom-0 z-[110] transition-transform duration-300 translate-x-full lg:translate-x-0 overflow-hidden';
        this.render('UnifiedSidebar', unifiedSidebar);

        this.render('MobileNav', app.appendChild(document.createElement('div')));

        this.renderModals(app, [
            'MoreMenu', 'TokenModal', 'ConnectModal', 'PINSheet',
            'InternalWalletSheet', 'SlippageModal', 'WalletSwitcher',
            'TxConfirmModal', 'TxResultModal', 'AIModal', 'FAQModal', 'ConsoleModal'
        ]);
    },

    renderModals: function(app, modalNames) {
        const container = app.appendChild(document.createElement('div'));
        container.id = 'modals-container';
        modalNames.forEach(name => {
            this.render(name, container.appendChild(document.createElement('div')));
        });
    }
};
