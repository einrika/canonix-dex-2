// ============================================
// MOBILENAV COMPONENT (ES Module)
// ============================================

export const MobileNav = {
    render: () => {
        return `
            <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-secondary z-[100] px-6 py-2 pb-safe shadow-lg">
                <div class="flex justify-between items-center max-w-md mx-auto">
                    <button onclick="window.toggleMobileSidebar?.()" class="flex flex-col items-center gap-1 group">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-secondary group-hover:bg-accent group-hover:text-black transition-all">
                            <i class="fas fa-search text-xs"></i>
                        </div>
                        <span class="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-text group-hover:text-primary-text">Assets</span>
                    </button>

                    <button onclick="window.setSidebarTab?.('send')" class="flex flex-col items-center gap-1 group">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-secondary group-hover:bg-soft-info group-hover:text-black transition-all">
                            <i class="fas fa-paper-plane text-xs"></i>
                        </div>
                        <span class="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-text group-hover:text-primary-text">Send</span>
                    </button>

                    <button onclick="window.toggleUnifiedSidebar?.()" class="flex flex-col items-center gap-1 group">
                        <div class="w-12 h-12 -mt-6 rounded-2xl bg-accent border-2 border-secondary shadow-brutal-sm flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                            <i class="fas fa-wallet text-sm"></i>
                        </div>
                        <span class="text-[8px] font-mono font-bold uppercase tracking-widest text-accent group-hover:text-primary-text mt-1">Wallet</span>
                    </button>

                    <button onclick="window.setSidebarTab?.('history')" class="flex flex-col items-center gap-1 group">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-secondary group-hover:bg-soft-warning group-hover:text-black transition-all">
                            <i class="fas fa-history text-xs"></i>
                        </div>
                        <span class="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-text group-hover:text-primary-text">History</span>
                    </button>

                    <button onclick="window.toggleMoreMenu?.()" class="flex flex-col items-center gap-1 group">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center bg-card border border-secondary group-hover:bg-soft-failed group-hover:text-primary-text transition-all">
                            <i class="fas fa-ellipsis-h text-xs"></i>
                        </div>
                        <span class="text-[8px] font-mono font-bold uppercase tracking-widest text-muted-text group-hover:text-primary-text">More</span>
                    </button>
                </div>
            </div>
        `;
    },
    init: () => {}
};
