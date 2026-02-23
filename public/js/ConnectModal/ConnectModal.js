window.UIManager.registerLogic('ConnectModal', (container) => {
    container.querySelector('#close-connect-modal')?.addEventListener('click', () => window.hideConnectModal());
    container.querySelectorAll('.connect-wallet-btn').forEach(btn => {
        btn.addEventListener('click', () => window.connectWallet(btn.dataset.type));
    });
});
