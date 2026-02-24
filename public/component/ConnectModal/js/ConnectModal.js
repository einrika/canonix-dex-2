window.UIManager.registerUI('ConnectModal', () => {
    return `
        <div id="connectModal" class="hidden fixed inset-0 bg-primary/95 z-[100] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-xs overflow-hidden">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-accent">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Connect Wallet</h3>
                    <button id="close-connect-modal" class="text-black hover:scale-110 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div class="p-3 space-y-2 bg-primary">
                    <button data-type="internal" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group connect-wallet-btn">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-soft-success border border-secondary flex items-center justify-center text-black text-base group-hover:rotate-6 transition-transform"><i class="fas fa-shield-alt"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">Internal</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Secure & Encrypted</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                    <button data-type="paxihub" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group connect-wallet-btn">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-soft-failed border border-secondary flex items-center justify-center text-primary-text text-base group-hover:rotate-6 transition-transform"><i class="fas fa-wallet"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">PaxiHub</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Mobile & Extension</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                    <button data-type="keplr" class="w-full flex items-center justify-between p-3 bg-secondary border border-secondary shadow-brutal-sm hover:shadow-none transition-all group connect-wallet-btn">
                        <div class="flex items-center gap-2.5 text-left">
                            <div class="w-8 h-8 bg-accent border border-secondary flex items-center justify-center text-black text-base group-hover:rotate-6 transition-transform"><i class="fas fa-rocket"></i></div>
                            <div>
                                <div class="text-base font-display text-primary-text uppercase leading-none">Keplr</div>
                                <div class="font-mono text-[6px] text-muted-text font-bold uppercase">Cosmos Extension</div>
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-muted-text text-[10px]"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('ConnectModal', (container) => {
    container.querySelector('#close-connect-modal')?.addEventListener('click', () => window.hideConnectModal());
    container.querySelectorAll('.connect-wallet-btn').forEach(btn => {
        btn.addEventListener('click', () => window.connectWallet(btn.dataset.type));
    });
});

window.showConnectModal = function() {
    window.removeClass('connectModal', 'hidden');
    window.addClass('connectModal', 'flex');
};

window.hideConnectModal = function() {
    window.addClass('connectModal', 'hidden');
    window.removeClass('connectModal', 'flex');
};
