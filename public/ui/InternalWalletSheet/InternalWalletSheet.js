export const InternalWalletSheetUI = (props) => {
    return `
        <div id="internalWalletSheet" class="hidden fixed inset-0 bg-black/95 z-[400] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-sm overflow-hidden animate-slide-up">
                <div class="p-6 text-center border-b-4 border-black bg-meme-green">
                    <h3 id="walletSheetTitle" class="text-3xl font-display text-black italic uppercase tracking-tighter">Internal Wallet</h3>
                </div>
                <div id="walletSheetContent" class="p-8 space-y-6"></div>
            </div>
        </div>
    `;
};
