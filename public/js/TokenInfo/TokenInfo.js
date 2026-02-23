window.UIManager.registerLogic('TokenInfo', (container) => {
    container.querySelector('#copy-ca-btn')?.addEventListener('click', () => window.copyAddrText());
});
