window.UIManager.registerUI('TokenModal', () => {
    return `
        <div id="tokenModal" class="hidden fixed inset-0 bg-primary/95 z-[333] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-accent">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Select Token</h3>
                    <button id="close-token-modal" class="text-black hover:rotate-90 transition-transform">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="p-3 bg-primary border-b border-secondary">
                    <input type="text" id="tokenSearch" placeholder="SEARCH..." class="w-full px-3 py-2 bg-secondary border border-secondary text-primary-text font-sans text-sm outline-none focus:border-accent placeholder:text-muted-text uppercase">
                </div>
                <div id="tokenList" class="flex-1 overflow-y-auto no-scrollbar bg-bg"></div>
            </div>
        </div>
    `;
});
