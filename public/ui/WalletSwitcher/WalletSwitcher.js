export const WalletSwitcherUI = (props) => {
    return `
        <div id="walletSwitcherModal" class="hidden fixed inset-0 bg-black/95 z-[600] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-md overflow-hidden">
                <div class="p-4 border-b-4 border-black flex justify-between items-center bg-meme-cyan">
                    <h3 class="text-2xl font-display text-black italic uppercase tracking-tighter">My Wallets</h3>
                    <button id="closeWalletSwitcher" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-xl"></i></button>
                </div>
                <div id="walletListContainer" class="p-4 max-h-[400px] overflow-y-auto no-scrollbar space-y-3 bg-bg"></div>
                <div class="p-4 border-t-2 border-black flex gap-3">
                    <button id="createNewWallet" class="flex-1 py-3 bg-meme-green text-black font-display text-lg border-2 border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">CREATE NEW</button>
                    <button id="importExistingWallet" class="flex-1 py-3 bg-black text-white font-display text-lg border-2 border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">IMPORT</button>
                </div>
            </div>
        </div>
    `;
};
