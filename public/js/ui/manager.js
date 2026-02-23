/**
 * UI MANAGER - Central orchestration for Pure JS Rendering
 */

window.UIManager = {
    components: {},
    registry: new Map(),

    register: function(name, renderFn) {
        this.registry.set(name, renderFn);
    },

    render: function(name, container, props = {}) {
        if (typeof container === 'string') {
            container = document.getElementById(container);
        }
        if (!container) return null;

        const renderFn = this.registry.get(name);
        if (!renderFn) {
            console.error(`Component ${name} not registered`);
            return null;
        }

        const result = renderFn(props);
        let html = '';
        let postRender = null;

        if (typeof result === 'object' && result.html) {
            html = result.html;
            postRender = result.postRender;
        } else {
            html = result;
        }

        if (html instanceof HTMLElement) {
            container.innerHTML = '';
            container.appendChild(html);
        } else {
            container.innerHTML = html;
        }

        if (postRender && typeof postRender === 'function') {
            postRender(container);
        }

        return container;
    },

    // Initialize the entire page structure
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
        // Build Trade Layout
        app.className = "bg-bg text-primary-text font-sans h-screen flex flex-col overflow-hidden selection:bg-soft-failed selection:text-primary-text";

        // 1. Header
        const header = document.createElement('header');
        header.id = 'main-header';
        app.appendChild(header);
        this.render('header', header, { type: 'trade' });

        // 2. Ticker
        const ticker = document.createElement('div');
        ticker.id = 'main-ticker';
        app.appendChild(ticker);
        this.render('ticker', ticker);

        // 3. Main Content Area (Sidebars + Main)
        const contentArea = document.createElement('div');
        contentArea.className = "flex-1 flex overflow-hidden";
        app.appendChild(contentArea);

        // 3a. Left Sidebar
        const leftSidebar = document.createElement('aside');
        leftSidebar.id = 'tokenSidebar';
        leftSidebar.className = "w-[240px] border-r border-secondary bg-bg flex flex-col lg:static fixed left-0 top-12 bottom-0 z-[110] transition-transform duration-300 -translate-x-full lg:translate-x-0 overflow-hidden";
        contentArea.appendChild(leftSidebar);
        this.render('tokenSidebar', leftSidebar);

        // 3b. Main
        const main = document.createElement('main');
        main.id = 'main-content';
        main.className = "flex-1 overflow-y-auto bg-bg relative no-scrollbar";
        contentArea.appendChild(main);
        this.render('tradeMain', main);

        // 3c. Right Sidebar
        const rightSidebar = document.createElement('aside');
        rightSidebar.id = 'unifiedSidebar';
        rightSidebar.className = "w-[280px] border-l border-secondary bg-bg flex flex-col lg:static fixed right-0 top-12 bottom-0 z-[110] transition-transform duration-300 translate-x-full lg:translate-x-0 overflow-hidden";
        contentArea.appendChild(rightSidebar);
        this.render('unifiedSidebar', rightSidebar);

        // 4. Mobile Nav
        const mobileNav = document.createElement('div');
        mobileNav.id = 'mobile-nav';
        app.appendChild(mobileNav);
        this.render('mobileNav', mobileNav);

        // 5. Modals Container
        const modals = document.createElement('div');
        modals.id = 'modals-container';
        app.appendChild(modals);
        this.render('modals', modals);

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

    renderLandingPage: function(app) {
        app.className = "min-h-screen bg-bg text-primary-text font-sans selection:bg-meme-pink selection:text-primary-text";

        // 1. Ticker
        const ticker = document.createElement('div');
        ticker.id = 'main-ticker';
        app.appendChild(ticker);
        this.render('ticker', ticker, { type: 'landing' });

        // 2. Nav
        const nav = document.createElement('nav');
        nav.id = 'main-nav';
        app.appendChild(nav);
        this.render('header', nav, { type: 'landing' });

        // 3. Main Content
        const main = document.createElement('main');
        app.appendChild(main);
        this.render('landingMain', main);

        // 4. Footer
        const footer = document.createElement('footer');
        app.appendChild(footer);
        this.render('footer', footer);

        // 5. Modals (Connect etc might be needed if landing has trade features)
        const modals = document.createElement('div');
        modals.id = 'modals-container';
        app.appendChild(modals);
        this.render('modals', modals);
    }
};
