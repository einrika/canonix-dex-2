window.UIManager.registerLogic('InternalWalletSheet', (container) => {
    container.querySelector('#close-internal-wallet')?.addEventListener('click', () => window.hideInternalWalletSheet());
});
