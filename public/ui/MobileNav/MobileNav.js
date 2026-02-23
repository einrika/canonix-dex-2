window.UIManager.registerUI('MobileNav', () => {
    return `
        <div class="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg border-t border-secondary z-[100] flex flex-col justify-center p-1">
            <div class="flex items-center justify-around w-full">
                <button id="mob-market-btn" class="flex flex-col items-center gap-0.5 text-muted-text">
                    <i class="fas fa-th-list text-base"></i>
                    <span class="text-[7px] font-bold uppercase font-sans tracking-tight">Market</span>
                </button>
                <button id="mob-chart-btn" class="flex flex-col items-center gap-0.5 text-accent">
                    <i class="fas fa-chart-line text-base"></i>
                    <span class="text-[7px] font-bold uppercase font-sans tracking-tight">Chart</span>
                </button>
                <button id="mob-wallet-btn" class="w-10 h-10 -mt-8 bg-accent border border-secondary shadow-brutal flex items-center justify-center text-black rotate-45">
                    <i class="fas fa-wallet text-lg -rotate-45"></i>
                </button>
                <button id="mob-ai-btn" class="flex flex-col items-center gap-0.5 text-soft-warning">
                    <i class="fas fa-brain text-base"></i>
                    <span class="text-[7px] font-bold uppercase font-sans tracking-tight">AI Brain</span>
                </button>
                <button id="mob-apps-btn" class="flex flex-col items-center gap-0.5 text-soft-failed">
                    <i class="fas fa-ellipsis-h text-base"></i>
                    <span class="text-[7px] font-bold uppercase font-sans tracking-tight">Apps</span>
                </button>
            </div>
        </div>
    `;
});
