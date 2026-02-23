window.UIManager.registerUI('MoreMenu', () => {
    return `
        <div id="moreMenuModal" class="hidden fixed inset-0 bg-primary/95 z-[200] flex flex-col animate-fade-in p-4">
            <div class="flex justify-between items-center mb-6">
                <a href="index.html" class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="asset/android-icon-192x192.png" alt="Canonix Logo" class="w-6 h-6 object-contain">
                    <span class="text-accent font-display uppercase tracking-tight text-lg">
                        Canonix
                    </span>
                </a>

                <h2 class="text-2xl font-display text-accent uppercase tracking-tight">EXPLORER</h2>

                <button id="close-more-menu" class="w-8 h-8 flex items-center justify-center border border-secondary shadow-brutal hover:rotate-90 transition-transform">
                    <i class="fas fa-ellipsis-v text-accent text-base"></i>
                </button>
            </div>
            <div class="flex-1 overflow-y-auto no-scrollbar">
                <div class="grid grid-cols-2 gap-3">
                    <a href="launchpad.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-success border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-rocket"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-success transition-colors uppercase">Launchpad</span>
                    </a>
                    <a href="pre-market.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-failed border border-secondary flex items-center justify-center text-primary-text group-hover:rotate-6 transition-transform text-base"><i class="fas fa-clock"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-failed transition-colors uppercase">Pre-Market</span>
                    </a>
                    <a href="vesting.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-accent border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-layer-group"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-accent transition-colors uppercase">Vesting</span>
                    </a>
                    <a href="locked-liquidity-pool.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-warning border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-lock"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-warning transition-colors uppercase">Lp Lock</span>
                    </a>
                    <a href="reward.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-soft-success border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-gift"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-soft-success transition-colors uppercase">Rewards</span>
                    </a>
                    <a href="daily.html" class="flex flex-col items-center gap-2 p-4 bg-secondary border border-secondary shadow-brutal hover:shadow-none transition-all group text-center">
                        <div class="w-10 h-10 bg-accent border border-secondary flex items-center justify-center text-black group-hover:rotate-6 transition-transform text-base"><i class="fas fa-calendar-check"></i></div>
                        <span class="font-display text-base text-primary-text group-hover:text-accent transition-colors uppercase">Daily</span>
                    </a>
                </div>
            </div>
            <div class="mt-6">
                <button id="more-menu-connect" class="w-full py-3 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase italic">Connect Wallet</button>
            </div>
        </div>
    `;
});
