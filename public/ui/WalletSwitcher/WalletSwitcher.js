window.UIManager.registerUI('WalletSwitcher', () => {
    return `
        <div id="walletSwitcherModal" class="hidden fixed inset-0 bg-primary/95 z-[60000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-xs overflow-hidden">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-soft-success">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Switch Wallet</h3>
                    <button id="close-wallet-switcher" class="text-black hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div id="walletListContainer" class="p-3 space-y-2 bg-primary max-h-[50vh] overflow-y-auto no-scrollbar">
                    <!-- Populated by JS -->
                </div>
                <div class="p-3 bg-secondary border-t border-secondary">
                    <div class="flex flex-col gap-3 w-full">
                        <button id="wallet-switcher-create" class="w-full py-3 bg-soft-success text-black font-display text-lg border border-secondary shadow-brutal hover:shadow-none transition-all uppercase">CREATE NEW WALLET</button>
                        <button id="wallet-switcher-import" class="w-full py-3 bg-primary border border-secondary text-primary-text font-display text-lg shadow-minimal hover:shadow-none transition-all uppercase">IMPORT WALLET</button>
                    </div>
                </div>
            </div>
        </div>
    `;
});
