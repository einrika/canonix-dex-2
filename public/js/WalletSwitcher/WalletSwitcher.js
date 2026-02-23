export const WalletSwitcherLogic = (container) => {
    container.querySelector('#close-wallet-switcher')?.addEventListener('click', () => window.WalletUI.hideWalletSwitcher());
    container.querySelector('#wallet-switcher-create')?.addEventListener('click', () => {
        window.WalletUI.hideWalletSwitcher();
        window.WalletUI.showCreateModal();
    });
    container.querySelector('#wallet-switcher-import')?.addEventListener('click', () => {
        window.WalletUI.hideWalletSwitcher();
        window.WalletUI.showImportModal();
    });
};
