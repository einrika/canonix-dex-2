export const TxResultModalLogic = (container) => {
    container.querySelector('#close-tx-result')?.addEventListener('click', () => window.closeTxResult());
};
