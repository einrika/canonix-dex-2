export const MoreMenuUI = (props) => {
    return `
        <div id="moreMenuModal" class="hidden fixed inset-0 bg-black/95 z-[200] flex flex-col animate-fade-in p-4">
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-3xl font-display text-meme-cyan italic tracking-tighter uppercase">EXPLORER</h2>
                <button id="closeMoreMenu" class="w-10 h-10 flex items-center justify-center border-2 border-black bg-meme-pink text-white shadow-brutal hover:rotate-90 transition-transform">
                    <i class="fas fa-times text-lg"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div class="grid grid-cols-2 gap-4">
                    <a href="launchpad.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-green border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-rocket"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-green transition-colors uppercase italic tracking-tighter">Launchpad</span>
                    </a>
                    <a href="pre-market.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-pink border-2 border-black flex items-center justify-center text-white group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-clock"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-pink transition-colors uppercase italic tracking-tighter">Pre-Market</span>
                    </a>
                    <a href="vesting.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-cyan border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-layer-group"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-cyan transition-colors uppercase italic tracking-tighter">Vesting</span>
                    </a>
                    <a href="locked-liquidity-pool.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-yellow border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-lock"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-yellow transition-colors uppercase italic tracking-tighter">Lp Lock</span>
                    </a>
                    <a href="reward.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-green border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-gift"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-green transition-colors uppercase italic tracking-tighter">Rewards</span>
                    </a>
                    <a href="daily.html" class="flex flex-col items-center gap-3 p-6 bg-meme-surface border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all group text-center">
                        <div class="w-12 h-12 bg-meme-cyan border-2 border-black flex items-center justify-center text-black group-hover:rotate-12 transition-transform text-lg"><i class="fas fa-calendar-check"></i></div>
                        <span class="font-display text-lg text-white group-hover:text-meme-cyan transition-colors uppercase italic tracking-tighter">Daily</span>
                    </a>
                </div>
            </div>
            <div class="mt-8">
                <button id="moreMenuConnectBtn" class="w-full py-4 bg-meme-pink text-white font-display text-2xl border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic tracking-tighter">Connect Wallet</button>
            </div>
        </div>
    `;
};
