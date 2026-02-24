window.UIManager.registerUI('Header', (props) => {
    const isLanding = props.type === 'landing';

    if (isLanding) {
        return `
            <div class="max-w-7xl mx-auto h-14 flex justify-between items-center px-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 border-2 border-card shadow-brutal-sm flex items-center justify-center rotate-[-5deg] overflow-hidden">
                        <img src="public/assets/logo.png" alt="Logo" class="w-full h-full object-contain" onerror="this.src='asset/android-icon-192x192.png'">
                    </div>
                    <span class="text-2xl font-display tracking-widest text-primary-text italic">CANONIX</span>
                </div>
                <div class="hidden md:flex items-center gap-4">
                    <a href="#market" class="font-display text-lg text-primary-text hover:text-meme-green transition-colors uppercase italic">Markets</a>
                    <a href="trade.html" class="font-display text-lg text-primary-text hover:text-meme-cyan transition-colors uppercase italic">Degen Trade</a>
                    <a href="faq.html" class="font-display text-lg text-primary-text hover:text-meme-pink transition-colors uppercase italic">FAQ</a>
                </div>
                <div class="flex items-center gap-2">
                    <a href="trade.html" class="bg-meme-pink text-primary-text font-display text-lg px-4 py-1.5 border-2 border-card shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all uppercase italic">APP</a>
                </div>
            </div>
        `;
    }

    // Trade Header
    return `
        <div class="flex items-center justify-between px-3 h-12">
            <div class="flex items-center gap-2">
                <button id="mobile-sidebar-toggle" class="lg:hidden text-primary-text p-1 border border-secondary bg-secondary"><i class="fas fa-bars"></i></button>
                <a href="index.html" class="flex items-center group">
                    <div class="w-7 h-7 bg-accent border border-secondary shadow-brutal-sm flex items-center justify-center rotate-[-3deg] group-hover:rotate-0 transition-transform mr-2">
                        <i class="fas fa-exchange-alt text-black text-[10px]"></i>
                    </div>
                    <h1 class="text-lg font-display tracking-tight text-primary-text group-hover:text-accent transition-colors">
                        CANONIX
                        <span class="ml-1 text-[7px] px-1 py-0.5 bg-soft-warning text-black border border-secondary font-mono font-bold uppercase tracking-tight">MAINNET</span>
                    </h1>
                </a>
            </div>

            <div class="flex items-center gap-2">
                <div class="hidden xl:flex items-center gap-1.5 border-r border-secondary pr-2 mr-1 h-full">
                    <button id="nav-send-btn" title="Send Assets" class="w-7 h-7 flex items-center justify-center border border-secondary bg-soft-info text-black hover:bg-secondary transition-all shadow-brutal-sm"><i class="fas fa-paper-plane text-[10px]"></i></button>
                    <button id="nav-lp-btn" title="Liquidity" class="w-7 h-7 flex items-center justify-center border border-secondary bg-soft-success text-black hover:bg-secondary transition-all shadow-brutal-sm"><i class="fas fa-layer-group text-[10px]"></i></button>
                    <button id="nav-donate-btn" title="Donate" class="w-7 h-7 flex items-center justify-center border border-secondary bg-soft-failed text-primary-text hover:bg-secondary hover:text-black transition-all shadow-brutal-sm"><i class="fas fa-heart text-[10px]"></i></button>
                    <a href="faq.html" title="FAQ" class="w-7 h-7 flex items-center justify-center border border-secondary bg-secondary text-black hover:bg-soft-warning transition-all shadow-brutal-sm"><i class="fas fa-question text-[10px]"></i></a>
                    <button id="nav-console-btn" title="System Console" class="w-7 h-7 flex items-center justify-center border border-secondary bg-secondary text-soft-success hover:bg-soft-success hover:text-black transition-all shadow-brutal-sm"><i class="fas fa-terminal text-[10px]"></i></button>
                    <button id="nav-settings-btn" title="Settings" class="w-7 h-7 flex items-center justify-center border border-secondary bg-secondary text-primary-text hover:bg-secondary hover:text-black transition-all shadow-brutal-sm"><i class="fas fa-cog text-[10px]"></i></button>
                </div>

                <div id="walletInfo" class="hidden sm:flex items-center gap-2 px-2 py-1 bg-secondary border border-secondary shadow-brutal-sm">
                    <div class="text-right">
                        <div id="walletAddrShort" class="text-[7px] font-mono text-muted-text font-bold uppercase">...</div>
                        <div id="walletBalance" class="text-[9px] font-display text-accent italic">0.00 PAXI</div>
                    </div>
                    <div class="w-5 h-5 bg-secondary border border-secondary flex items-center justify-center text-primary-text rotate-[5deg]"><i class="fas fa-wallet text-[9px]"></i></div>
                </div>
                <button id="connectBtn" class="bg-accent text-black font-display text-sm px-3 py-1 border border-secondary shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 uppercase">
                    <i class="fas fa-plug text-[10px]"></i><span class="hidden xs:inline">Connect</span>
                </button>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('Header', (container, props) => {
    if (props.type === 'landing') return;

    container.querySelector('#mobile-sidebar-toggle')?.addEventListener('click', () => window.toggleMobileSidebar());
    container.querySelector('#nav-send-btn')?.addEventListener('click', () => window.setSidebarTab('send'));
    container.querySelector('#nav-lp-btn')?.addEventListener('click', () => window.setSidebarTab('lp'));
    container.querySelector('#nav-donate-btn')?.addEventListener('click', () => window.setSidebarTab('donate'));
    container.querySelector('#nav-console-btn')?.addEventListener('click', () => window.toggleConsoleModal());
    container.querySelector('#nav-settings-btn')?.addEventListener('click', () => window.location.href = 'setting.html');
    container.querySelector('#connectBtn')?.addEventListener('click', () => window.showConnectModal());
});

window.showError = function(message) {
    const modal = document.getElementById('errorModal');
    if (modal) {
        window.setText('errorText', message);
        modal.classList.remove('hidden');
    } else {
        console.error("Critical Error:", message);
    }
};
