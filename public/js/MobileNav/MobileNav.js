export const MobileNavLogic = (container) => {
    container.querySelector('#mobile-nav-market')?.addEventListener('click', () => {
        window.toggleMobileSidebar();
        setActiveNav('market');
    });
    container.querySelector('#mobile-nav-trade')?.addEventListener('click', () => {
        window.setSidebarTab('swap');
        window.toggleUnifiedSidebar();
        setActiveNav('trade');
    });
    container.querySelector('#mobile-nav-wallet')?.addEventListener('click', () => {
        window.setSidebarTab('wallet');
        window.toggleUnifiedSidebar();
        setActiveNav('wallet');
    });
    container.querySelector('#mobile-nav-lp')?.addEventListener('click', () => {
        window.setSidebarTab('lp');
        window.toggleUnifiedSidebar();
        setActiveNav('lp');
    });
    container.querySelector('#mobile-nav-more')?.addEventListener('click', () => {
        window.toggleMoreMenu();
    });
};

export const setActiveNav = (tab) => {
    const ids = ['market', 'trade', 'lp'];
    ids.forEach(id => {
        const el = document.getElementById(`mobile-nav-${id}`);
        if (el) {
            el.classList.remove('text-accent');
            el.classList.add('text-muted-text');
        }
    });

    const active = document.getElementById(`mobile-nav-${tab}`);
    if (active) {
        active.classList.add('text-accent');
        active.classList.remove('text-muted-text');
    }
};
