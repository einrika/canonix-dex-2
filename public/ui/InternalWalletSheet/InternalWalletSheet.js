window.UIManager.registerUI('InternalWalletSheet', () => {
    return `
        <div id="internalWalletSheet" class="fixed inset-0 bg-primary/80 z-[190] flex items-end justify-center transition-transform duration-300 translate-y-full">
            <div class="bg-secondary w-full max-w-md rounded-t-[2rem] border-t-2 border-secondary p-6 flex flex-col items-center">
                <div class="w-12 h-1 bg-primary rounded-full mb-6"></div>
                <div id="walletSheetContent" class="w-full">
                    <!-- Dynamically populated -->
                </div>
                <button id="close-internal-wallet" class="mt-6 font-display text-lg text-muted-text uppercase tracking-widest hover:text-soft-failed transition-colors">Close</button>
            </div>
        </div>
    `;
});
