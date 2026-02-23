window.UIManager.registerUI('TokenSidebar', () => {
    return `
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
    `;
});
