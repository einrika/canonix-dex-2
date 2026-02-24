export const TokenSidebarUI = (props) => {
    return `
        <div class="p-3 bg-meme-surface border-b-2 border-black">
            <div class="relative mb-3">
                <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-meme-cyan text-xs"></i>
                <input type="text" id="tokenSidebarSearch" placeholder="SEARCH..." class="w-full pl-8 pr-3 py-2 bg-black border border-black text-xs font-display outline-none focus:border-meme-cyan transition-all text-white placeholder:text-gray-700 italic uppercase">
            </div>
            <div class="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <button data-sort="hot" class="sort-btn px-3 py-1 border-2 border-black bg-meme-green text-black font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic">HOT</button>
                <button data-sort="new" class="sort-btn px-3 py-1 border-2 border-black bg-black text-white font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic">NEW</button>
                <button data-sort="gainer" class="sort-btn px-3 py-1 border-2 border-black bg-black text-white font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic">WIN</button>
                <button data-sort="marketcap" class="sort-btn px-3 py-1 border-2 border-black bg-black text-white font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic">MCAP</button>
                <button data-sort="verified" class="sort-btn px-3 py-1 border-2 border-black bg-black text-white font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic">VERIFIED</button>
                <button data-sort="nonpump" class="sort-btn px-3 py-1 border-2 border-black bg-black text-white font-display text-[10px] shadow-brutal-sm hover:shadow-none hover:bg-meme-green hover:text-black transition-all uppercase italic whitespace-nowrap">NON-PUMP</button>
            </div>
        </div>
        <div id="tokenSidebarList" class="flex-1 overflow-y-auto no-scrollbar bg-bg">
            <div class="p-8 text-center text-gray-500">
                <div class="w-8 h-8 border-2 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="font-mono text-[8px] font-bold uppercase tracking-widest italic">Scanning...</p>
            </div>
        </div>
    `;
};
