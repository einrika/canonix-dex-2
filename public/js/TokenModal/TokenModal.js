window.UIManager.registerLogic('TokenModal', (container) => {
    container.querySelector('#close-token-modal')?.addEventListener('click', () => window.hideTokenSelector());
    container.querySelector('#tokenSearch')?.addEventListener('input', () => window.filterTokens());
});
