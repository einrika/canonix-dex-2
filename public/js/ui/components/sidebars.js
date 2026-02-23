/**
 * SIDEBAR COMPONENTS
 */

window.UIManager.register('tokenSidebar', () => {
    return {
        html: `
            <div class="p-2 bg-secondary border-b border-secondary">
                <div class="relative mb-2">
                    <i class="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-accent text-[10px]"></i>
                    <input type="text" id="tokenSidebarSearch" placeholder="SEARCH..." class="w-full pl-7 pr-2 py-1.5 bg-secondary border border-secondary text-[10px] font-sans outline-none focus:border-accent transition-all text-primary-text placeholder:text-muted-text uppercase">
                </div>
                <div class="flex gap-1 overflow-x-auto no-scrollbar pb-1" id="token-sort-btns">
                    <button data-sort="hot" class="sort-btn px-2 py-0.5 border border-secondary bg-accent text-black font-display text-[9px] shadow-brutal-sm hover:shadow-none transition-all uppercase">HOT</button>
                    <button data-sort="new" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">NEW</button>
                    <button data-sort="gainer" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">WIN</button>
                    <button data-sort="marketcap" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">MCAP</button>
                    <button data-sort="verified" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">VERIFIED</button>
                    <button data-sort="nonpump" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase whitespace-nowrap">NON-PUMP</button>
                </div>
            </div>
            <div id="tokenSidebarList" class="flex-1 overflow-y-auto no-scrollbar bg-bg">
                <div class="p-8 text-center text-muted-text">
                    <div class="w-8 h-8 border border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p class="font-mono text-[8px] font-bold uppercase tracking-widest italic">Scanning...</p>
                </div>
            </div>
        `,
        postRender: (container) => {
            container.querySelector('#tokenSidebarSearch')?.addEventListener('input', () => window.filterTokenSidebar());
            container.querySelectorAll('#token-sort-btns button').forEach(btn => {
                btn.addEventListener('click', (e) => window.setSort(btn.dataset.sort, e));
            });
        }
    };
});

window.UIManager.register('unifiedSidebar', () => {
    return {
        html: `
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
        `,
        postRender: (container) => {
            container.querySelectorAll('#sidebar-tabs button').forEach(btn => {
                btn.addEventListener('click', () => window.setSidebarTab(btn.dataset.tab));
            });
        }
    };
});
