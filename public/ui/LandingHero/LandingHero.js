export const LandingHeroUI = () => {
    return `
        <header class="relative pt-8 pb-16 overflow-hidden px-4">
            <!-- Background Grid -->
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00FF9F_1px,transparent_1px)] bg-[length:20px_20px]"></div>

            <div class="max-w-7xl mx-auto relative z-10">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div class="reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <div class="inline-block px-2 py-0.5 bg-meme-cyan border border-card font-mono text-[8px] font-black text-black uppercase tracking-widest mb-4 rotate-[-2deg]">
                            App coming soon
                        </div>
                        <h1 class="text-3xl md:text-6xl font-display mb-4 leading-[0.9] tracking-tighter italic uppercase text-primary-text drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">
                            Unleash The <br>
                            <span class="text-meme-green">Meme Energy</span>
                        </h1>
                        <p class="font-mono text-secondary-text text-sm md:text-lg max-w-md mb-8 leading-relaxed font-bold uppercase italic">
                            Decentralized PRC20 trading for true degens. No cap, no ragrets, just pure pump.
                        </p>

                        <div class="flex flex-col sm:flex-row gap-4 mb-12">
                            <a href="trade.html" class="bg-meme-green text-black font-display text-2xl px-8 py-3 border-2 border-card shadow-brutal-green hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic text-center">TRADE NOW</a>
                            <a href="#market" class="bg-bg text-primary-text font-display text-2xl px-8 py-3 border-2 border-card shadow-brutal-cyan hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic text-center">EXPLORE</a>
                        </div>

                        <!-- Metrics -->
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <div class="text-3xl font-display text-meme-yellow italic mb-0.5 tracking-tighter">$<span class="counter" data-target="20">0</span>M+</div>
                                <div class="text-[8px] text-muted-text font-black uppercase tracking-widest font-mono italic text-center">Volume</div>
                            </div>
                            <div>
                                <div class="text-3xl font-display text-meme-pink italic mb-0.5 tracking-tighter"><span class="counter" data-target="6">0</span>K+</div>
                                <div class="text-[8px] text-muted-text font-black uppercase tracking-widest font-mono italic text-center">Traders</div>
                            </div>
                            <div>
                                <div class="text-3xl font-display text-meme-cyan italic mb-0.5 tracking-tighter"><span class="counter" data-target="400">0</span>+</div>
                                <div class="text-[8px] text-muted-text font-black uppercase tracking-widest font-mono italic text-center">Tokens</div>
                            </div>
                        </div>
                    </div>

                    <!-- Visual Asset -->
                    <div class="relative lg:block hidden">
                        <div class="bg-card border-4 border-card p-2 shadow-brutal-lg rotate-2 relative overflow-hidden group">
                            <div class="absolute -top-10 -right-10 w-40 h-40 bg-meme-green opacity-20 blur-3xl rounded-full"></div>
                            <div class="relative z-10 border-2 border-card bg-surface p-4">
                                <div class="flex items-center gap-1.5 mb-4">
                                    <div class="w-2 h-2 rounded-full bg-meme-pink border border-card"></div>
                                    <div class="w-2 h-2 rounded-full bg-meme-yellow border border-card"></div>
                                    <div class="w-2 h-2 rounded-full bg-meme-green border border-card"></div>
                                </div>
                                <div class="aspect-video bg-surface border-2 border-card relative flex items-center justify-center">
                                    <svg viewBox="0 0 100 40" class="w-full h-24 text-meme-green drop-shadow-[0_0_10px_#00FF9F]">
                                        <path d="M0,35 Q10,35 20,30 T40,20 T60,25 T80,5 T100,0" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse" />
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="font-display text-4xl text-primary-text uppercase italic tracking-tighter drop-shadow-[2px_2px_0_rgba(11,12,13,1)]">Pumping...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="absolute -top-8 -left-8 w-16 h-16 bg-meme-yellow border-2 border-card shadow-brutal rotate-[-15deg] animate-float"></div>
                        <div class="absolute -bottom-8 -right-8 w-14 h-14 bg-meme-pink border-2 border-card shadow-brutal rotate-[15deg] animate-float delay-[1s]"></div>
                    </div>
                </div>
            </div>
        </header>
    `;
};
