export const UnifiedSidebarUI = () => {
    return `
        <!-- Sidebar Navigation Tabs -->
        <div class="flex bg-secondary border-b border-secondary p-1 gap-1" id="sidebar-tabs">
            <button data-tab="wallet" id="side-tab-wallet" class="flex-1 py-1.5 bg-secondary border border-secondary text-accent font-display text-sm shadow-brutal-sm hover:shadow-none transition-all uppercase italic tracking-tight">Wallet</button>
            <button data-tab="swap" id="side-tab-swap" class="hidden"></button>
            <button data-tab="history" id="side-tab-history" class="hidden"></button>
            <button data-tab="lp" id="side-tab-lp" class="hidden"></button>
            <button data-tab="send" id="side-tab-send" class="hidden"></button>
            <button data-tab="burn" id="side-tab-burn" class="hidden"></button>
            <button data-tab="donate" id="side-tab-donate" class="hidden"></button>
        </div>

        <div id="sidebarContent" class="flex-1 overflow-y-auto p-4 no-scrollbar bg-bg">
            <!-- Content will be injected by JS based on tab -->
            <div class="text-center py-24 flex flex-col items-center">
                <div class="w-16 h-16 bg-secondary border border-secondary shadow-brutal flex items-center justify-center text-muted-text text-3xl mb-6 rotate-[-10deg]">
                    <i class="fas fa-lock"></i>
                </div>
                <p class="font-display text-xl text-muted-text uppercase italic tracking-tighter">Terminal Locked</p>
                <p class="font-mono text-[8px] text-muted-text mt-1.5 font-bold uppercase tracking-widest italic">Connect wallet to start</p>
            </div>
        </div>
    `;
};
