window.UIManager.registerLogic('TradeHeaderStats', (container) => {
    container.querySelector('#aiBtn')?.addEventListener('click', () => window.showAIAnalysis());
});
