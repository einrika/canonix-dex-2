export const MobileNavUI = (props) => {
    return `
        <div class="lg:hidden fixed bottom-0 left-0 right-0 h-20 bg-bg border-t-2 border-black z-[100] flex flex-col justify-between p-1.5">
            <div class="flex items-center justify-between w-full mb-1 px-3">
                <div class="flex items-center gap-2">
                    <h1 class="text-lg font-display text-meme-green italic tracking-tighter uppercase">CANONIX</h1>
                    <div id="mobileWalletInfo" class="hidden flex items-center px-2 py-0.5 bg-meme-card border border-black">
                        <div id="mobileWalletBalance" class="text-[8px] font-mono font-bold text-meme-pink uppercase tracking-tighter">0.00 PAXI</div>
                    </div>
                </div>
                <button id="mobileConnectBtn" class="px-3 py-0.5 bg-meme-pink text-white border border-black font-display text-xs uppercase italic tracking-tighter shadow-brutal-sm">Connect</button>
            </div>
            <div class="flex items-center justify-around w-full">
                <button id="mobile-market-btn" class="flex flex-col items-center gap-0.5 text-gray-600">
                    <i class="fas fa-th-list text-lg"></i>
                    <span class="text-[8px] font-black uppercase font-mono italic tracking-tight">Market</span>
                </button>
                <button id="mobile-chart-btn" class="flex flex-col items-center gap-0.5 text-meme-cyan">
                    <i class="fas fa-chart-line text-lg"></i>
                    <span class="text-[8px] font-black uppercase font-mono italic tracking-tight">Chart</span>
                </button>
                <button id="mobile-wallet-btn" class="w-12 h-12 -mt-10 bg-meme-green border-2 border-black shadow-brutal-green flex items-center justify-center text-black rotate-45">
                    <i class="fas fa-wallet text-xl -rotate-45"></i>
                </button>
                <button id="mobile-ai-btn" class="flex flex-col items-center gap-0.5 text-meme-yellow">
                    <i class="fas fa-brain text-lg"></i>
                    <span class="text-[8px] font-black uppercase font-mono italic tracking-tight">AI Brain</span>
                </button>
                <button id="mobile-more-btn" class="flex flex-col items-center gap-0.5 text-meme-pink">
                    <i class="fas fa-ellipsis-h text-lg"></i>
                    <span class="text-[8px] font-black uppercase font-mono italic tracking-tight">Apps</span>
                </button>
            </div>
        </div>
    `;
};
