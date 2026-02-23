export const InternalWalletSheetLogic = (container) => {
    container.querySelector('#close-internal-wallet')?.addEventListener('click', () => window.hideInternalWalletSheet());
};
