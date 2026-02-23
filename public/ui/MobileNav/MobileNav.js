export const MobileNavUI = () => {
    return `
        <div class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-secondary border-t border-secondary z-[150] flex items-center justify-around px-2 pb-safe">
            <button id="mobile-nav-market" class="flex flex-col items-center gap-1 text-accent">
                <i class="fas fa-chart-line text-lg"></i>
                <span class="text-[8px] font-black uppercase italic">Market</span>
            </button>
            <button id="mobile-nav-trade" class="flex flex-col items-center gap-1 text-muted-text">
                <i class="fas fa-exchange-alt text-lg"></i>
                <span class="text-[8px] font-black uppercase italic">Trade</span>
            </button>
            <div class="relative -top-4">
                <button id="mobile-nav-wallet" class="w-14 h-14 bg-accent border-4 border-secondary rounded-2xl shadow-brutal flex items-center justify-center text-black rotate-[-5deg]">
                    <i class="fas fa-wallet text-xl"></i>
                </button>
            </div>
            <button id="mobile-nav-lp" class="flex flex-col items-center gap-1 text-muted-text">
                <i class="fas fa-layer-group text-lg"></i>
                <span class="text-[8px] font-black uppercase italic">LP</span>
            </button>
            <button id="mobile-nav-more" class="flex flex-col items-center gap-1 text-muted-text">
                <i class="fas fa-ellipsis-h text-lg"></i>
                <span class="text-[8px] font-black uppercase italic">More</span>
            </button>
        </div>
    `;
};
