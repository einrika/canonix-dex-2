export const HeaderUI = (props) => {
    const isLanding = props.type === 'landing';

    if (isLanding) {
        return `
            <nav class="border-b-2 border-black bg-bg sticky top-0 z-50 px-4">
                <div class="max-w-7xl mx-auto h-14 flex justify-between items-center">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-meme-green border-2 border-black shadow-brutal-sm flex items-center justify-center rotate-[-5deg]">
                            <i class="fas fa-exchange-alt text-black text-sm"></i>
                        </div>
                        <span class="text-2xl font-display tracking-widest text-white italic">CANONIX</span>
                    </div>
                    <div class="hidden md:flex items-center gap-4">
                        <a href="#market" class="font-display text-lg text-white hover:text-meme-green transition-colors uppercase italic">Markets</a>
                        <a href="trade.html" class="font-display text-lg text-white hover:text-meme-cyan transition-colors uppercase italic">Degen Tech</a>
                        <a href="faq.html" class="font-display text-lg text-white hover:text-meme-pink transition-colors uppercase italic">Hackers</a>
                    </div>
                    <div class="flex items-center gap-2">
                        <a href="trade.html" class="bg-meme-pink text-white font-display text-lg px-4 py-1.5 border-2 border-black shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all uppercase italic">APP</a>
                    </div>
                </div>
            </nav>
        `;
    }

    // Trade Header Template (Simplified for now, will refine from main_trade.html)
    return `
        <div class="flex items-center justify-between px-3 h-12 bg-secondary border-b border-secondary">
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
};
