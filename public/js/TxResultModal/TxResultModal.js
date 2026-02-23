window.UIManager.registerLogic('TxResultModal', (container) => {
    container.querySelector('#close-tx-result')?.addEventListener('click', () => window.closeTxResult());
});
