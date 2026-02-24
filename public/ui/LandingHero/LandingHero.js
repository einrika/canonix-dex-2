export const LandingHeroUI = (props) => {
    return `
        <header class="relative pt-8 pb-16 overflow-hidden px-4">
            <div class="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00FF9F_1px,transparent_1px)] bg-[length:20px_20px]"></div>
            <div class="max-w-7xl mx-auto relative z-10">
                <div class="grid lg:grid-cols-2 gap-12 items-center">
                    <div class="reveal">
                        <div class="inline-block px-2 py-0.5 bg-meme-cyan border border-black font-mono text-[8px] font-black text-black uppercase tracking-widest mb-4 rotate-[-2deg]">
                            Bonding Curve Terminal v2.0
                        </div>
                        <h1 class="text-3xl md:text-6xl font-display mb-4 leading-[0.9] tracking-tighter italic uppercase text-white drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
                            Unleash The <br>
                            <span class="text-meme-green">Meme Energy</span>
                        </h1>
                        <p class="font-mono text-gray-500 text-sm md:text-lg max-w-md mb-8 leading-relaxed font-bold uppercase italic">
                            Decentralized PRC20 trading for true degens. No cap, no ragrets, just pure pump.
                        </p>
                        <div class="flex flex-col sm:flex-row gap-4 mb-12">
                            <a href="trade.html" class="bg-meme-green text-black font-display text-2xl px-8 py-3 border-2 border-black shadow-brutal-green hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic text-center">TRADE NOW</a>
                            <a href="#market" class="bg-meme-black text-white font-display text-2xl px-8 py-3 border-2 border-black shadow-brutal-cyan hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic text-center">EXPLORE</a>
                        </div>
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <div class="text-3xl font-display text-meme-yellow italic mb-0.5 tracking-tighter">$<span class="counter" data-target="20">0</span>M+</div>
                                <div class="text-[8px] text-gray-700 font-black uppercase tracking-widest font-mono italic text-center">Volume</div>
                            </div>
                            <div>
                                <div class="text-3xl font-display text-meme-pink italic mb-0.5 tracking-tighter"><span class="counter" data-target="6">0</span>K+</div>
                                <div class="text-[8px] text-gray-700 font-black uppercase tracking-widest font-mono italic text-center">Traders</div>
                            </div>
                            <div>
                                <div class="text-3xl font-display text-meme-cyan italic mb-0.5 tracking-tighter"><span class="counter" data-target="400">0</span>+</div>
                                <div class="text-[8px] text-gray-700 font-black uppercase tracking-widest font-mono italic text-center">Tokens</div>
                            </div>
                        </div>
                    </div>
                    <div class="relative lg:block hidden">
                        <div class="bg-meme-card border-4 border-black p-2 shadow-brutal-lg rotate-2 relative overflow-hidden group">
                            <div class="absolute -top-10 -right-10 w-40 h-40 bg-meme-green opacity-20 blur-3xl rounded-full"></div>
                            <div class="relative z-10 border-2 border-black bg-black p-4">
                                <div class="flex items-center gap-1.5 mb-4">
                                    <div class="w-2 h-2 rounded-full bg-meme-pink border border-black"></div>
                                    <div class="w-2 h-2 rounded-full bg-meme-yellow border border-black"></div>
                                    <div class="w-2 h-2 rounded-full bg-meme-green border border-black"></div>
                                </div>
                                <div class="aspect-video bg-meme-surface border-2 border-black relative flex items-center justify-center">
                                    <svg viewBox="0 0 100 40" class="w-full h-24 text-meme-green drop-shadow-[0_0_10px_#00FF9F]">
                                        <path d="M0,35 Q10,35 20,30 T40,20 T60,25 T80,5 T100,0" fill="none" stroke="currentColor" stroke-width="2" class="animate-pulse" />
                                    </svg>
                                    <div class="absolute inset-0 flex items-center justify-center">
                                        <span class="font-display text-4xl text-white uppercase italic tracking-tighter drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">Pumping...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="absolute -top-8 -left-8 w-16 h-16 bg-meme-yellow border-2 border-black shadow-brutal rotate-[-15deg] animate-float"></div>
                        <div class="absolute -bottom-8 -right-8 w-14 h-14 bg-meme-pink border-2 border-black shadow-brutal rotate-[15deg] animate-float delay-[1s]"></div>
                    </div>
                </div>
            </div>
        </header>
    `;
};
