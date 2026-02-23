window.UIManager.registerLogic('MobileNav', (container) => {
    container.querySelector('#mob-market-btn')?.addEventListener('click', () => window.toggleMobileSidebar());
    container.querySelector('#mob-chart-btn')?.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));
    container.querySelector('#mob-wallet-btn')?.addEventListener('click', () => window.toggleUnifiedSidebar());
    container.querySelector('#mob-ai-btn')?.addEventListener('click', () => window.showAIAnalysis());
    container.querySelector('#mob-apps-btn')?.addEventListener('click', () => window.toggleMoreMenu());
});
