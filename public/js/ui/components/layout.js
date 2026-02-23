/**
 * LAYOUT COMPONENTS
 */

window.UIManager.register('ticker', (props) => {
    const isLanding = props.type === 'landing';
    const bgColor = isLanding ? 'bg-meme-yellow' : 'bg-soft-warning';
    const borderColor = isLanding ? 'border-card' : 'border-secondary';
    const textColor = 'text-black';
    const textSize = isLanding ? 'text-sm' : 'text-[9px] md:text-xs';

    return `
        <div class="${bgColor} border-b ${isLanding ? 'border-b-2' : ''} ${borderColor} py-0.5 overflow-hidden whitespace-nowrap z-[60] relative flex items-center min-h-[24px] md:min-h-[28px]">
            <div id="tickerContent" class="animate-marquee inline-block">
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">LOADING MARKET DATA...</span>
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">$$$ MOON SOON $$$</span>
                <span class="inline-block ${textColor} font-display ${textSize} mx-4 md:mx-6 italic uppercase tracking-tight">PUMP IT HARDER</span>
            </div>
        </div>
    `;
});

window.UIManager.register('footer', () => {
    return `
        <footer class="py-16 bg-bg border-t-4 border-card">
            <div class="max-w-7xl mx-auto text-center">
                <div class="flex items-center justify-center gap-4 mb-12">
                    <div class="w-12 h-12 border-2 border-card shadow-brutal flex items-center justify-center rotate-[10deg] overflow-hidden">
                        <img src="public/assets/logo.png" alt="Logo" class="w-full h-full object-contain" onerror="this.src='asset/android-icon-192x192.png'">
                    </div>
                    <span class="text-3xl md:text-5xl font-display tracking-widest text-primary-text italic">CANONIX</span>
                </div>
                <div class="flex flex-wrap justify-center gap-8 font-display text-xl mb-12">
                    <a href="#" class="text-muted-text hover:text-meme-green transition-colors uppercase italic">Docs</a>
                    <a href="#" class="text-muted-text hover:text-meme-pink transition-colors uppercase italic">Github</a>
                    <a href="#" class="text-muted-text hover:text-meme-cyan transition-colors uppercase italic">Twitter</a>
                    <a href="#" class="text-muted-text hover:text-meme-yellow transition-colors uppercase italic">Telegram</a>
                </div>
                <div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-[0.5em]">
                    &copy; 2026 Canonix Protocol | Built by Degens for Degens
                </div>
            </div>
        </footer>
    `;
});

window.UIManager.register('tradeMain', () => {
    return {
        html: `
            <!-- Token Header / Stats -->
            <div class="bg-secondary border-y border-secondary px-3 py-2 mb-3 z-30">
                <div class="flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div class="flex items-center gap-3">
                        <div id="tokenLogo" class="w-10 h-10 bg-secondary border border-secondary shadow-brutal-sm flex items-center justify-center rotate-[-3deg]">
                            <i class="fas fa-coins text-black text-lg"></i>
                        </div>
                        <div>
                            <h2 id="selectedPair" class="text-xl font-display text-primary-text italic leading-none mb-0.5 uppercase tracking-tight">SELECT TOKEN</h2>
                            <div class="flex items-center gap-2">
                                <span id="currentPrice" class="text-[11px] font-mono font-bold text-accent">0.000000 PAXI</span>
                                <span id="priceChange" class="text-[9px] font-sans text-soft-success bg-primary px-1 border border-secondary">-0.00%</span>
                            </div>
                        </div>
                        <button id="aiBtn" class="bg-accent text-black font-display text-base px-2 py-0.5 border border-secondary shadow-brutal-sm hover:shadow-none transition-all uppercase italic">
                            <i class="fas fa-brain text-[10px]"></i> AI
                        </button>
                    </div>

                    <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full lg:w-auto">
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Mcap</div>
                            <div id="mcapVal" class="text-[8px] font-mono font-bold text-primary-text uppercase truncate">0 PAXI</div>
                        </div>
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Liq</div>
                            <div id="liqVal" class="text-[8px] font-mono font-bold text-accent uppercase truncate">0 PAXI</div>
                        </div>
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">High</div>
                            <div id="high24h" class="text-[8px] font-mono font-bold text-soft-success truncate">0.00</div>
                        </div>
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Low</div>
                            <div id="low24h" class="text-[8px] font-mono font-bold text-soft-failed truncate">0.00</div>
                        </div>
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Vol</div>
                            <div id="volVal" class="text-[8px] font-mono font-bold text-soft-warning uppercase truncate">0 PAXI</div>
                        </div>
                        <div class="bg-primary p-1 border border-secondary overflow-hidden">
                            <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Signal</div>
                            <div id="tradeSignal" class="text-[8px] font-display uppercase text-primary-text truncate">Neutral</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart Container -->
            <div class="p-2 md:p-3">
                <div class="bg-secondary border border-secondary shadow-minimal overflow-hidden">
                    <div class="p-2 border-b border-secondary flex items-center justify-between bg-secondary">
                        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar" id="chart-controls">
                            <div class="flex gap-1 pr-2 border-r border-secondary">
                                <button data-tf="realtime" class="tf-btn px-1.5 py-0.5 bg-accent text-black font-display text-[9px] border border-secondary shadow-brutal-sm hover:shadow-none transition-all uppercase">LIVE</button>
                                <button data-tf="1h" class="tf-btn px-1.5 py-0.5 bg-primary text-primary-text font-display text-[9px] border border-secondary shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">1H</button>
                                <button data-tf="24h" class="tf-btn px-1.5 py-0.5 bg-primary text-primary-text font-display text-[9px] border border-secondary shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">24H</button>
                            </div>
                            <div class="flex gap-1">
                                <button id="toggleMA7" class="px-1.5 py-0.5 bg-primary text-muted-text font-display text-[9px] border border-secondary shadow-brutal-sm hover:text-accent transition-all uppercase">MA7</button>
                                <button id="toggleMA25" class="px-1.5 py-0.5 bg-primary text-muted-text font-display text-[9px] border border-secondary shadow-brutal-sm hover:text-soft-failed transition-all uppercase">MA25</button>
                            </div>
                        </div>
                        <div id="chartStatus" class="font-mono text-[7px] text-soft-success font-bold uppercase tracking-widest animate-pulse">FEED ACTIVE</div>
                    </div>
                    <div class="h-[220px] md:h-[350px] w-full relative bg-primary" id="chartWrapper">
                        <div id="priceChart" class="w-full h-full"></div>
                    </div>
                </div>
            </div>

            <!-- Swap Section (Visible only when connected) -->
            <div id="mainSwapContainer" class="px-2 md:px-3 pb-3 hidden">
                <div class="bg-secondary border border-secondary shadow-minimal p-3" id="mainSwapTerminal">
                    <!-- Swap Content Injected by JS -->
                </div>
            </div>

            <!-- Detailed Stats Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 px-2 md:px-3 pb-3">
                <div class="bg-secondary border border-secondary p-3 shadow-minimal">
                    <h4 class="text-base font-display text-soft-success mb-3 flex items-center gap-2 uppercase tracking-tight">
                        <i class="fas fa-chart-pie text-xs"></i> TRADE STATS
                    </h4>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">BUYS</span>
                            <span id="buyCount" class="font-display text-lg text-soft-success">0</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">SELLS</span>
                            <span id="sellCount" class="font-display text-lg text-soft-failed">0</span>
                        </div>
                        <div class="h-1.5 w-full bg-primary border border-secondary overflow-hidden flex shadow-inner">
                            <div id="buyRatioBar" class="h-full bg-soft-success w-1/2"></div>
                        </div>
                        <div class="flex justify-between items-center pt-1">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">TOTAL</span>
                            <span id="txCount" class="font-display text-lg text-primary-text">0</span>
                        </div>
                    </div>
                </div>

                <div class="bg-secondary border border-secondary p-3 shadow-minimal">
                    <h4 class="text-base font-display text-accent mb-3 flex items-center gap-2 uppercase tracking-tight">
                        <i class="fas fa-droplet text-xs"></i> POOL DEPTH
                    </h4>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">PAXI</span>
                            <span id="resPaxi" class="font-display text-lg text-primary-text">0.00</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span id="resTokenLabel" class="font-mono text-[8px] text-muted-text font-bold uppercase truncate max-w-[80px]">PRC20</span>
                            <span id="resToken" class="font-display text-lg text-primary-text">0.00</span>
                        </div>
                        <div class="flex justify-between items-center border-t border-secondary pt-2">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">APES</span>
                            <span id="holderCount" class="font-display text-lg text-accent">0</span>
                        </div>
                    </div>
                </div>

                <div class="bg-secondary border border-secondary p-3 shadow-minimal">
                    <h4 class="text-base font-display text-soft-warning mb-3 flex items-center gap-2 uppercase tracking-tight">
                        <i class="fas fa-info-circle text-xs"></i> TOKEN INFO
                    </h4>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">SUPPLY</span>
                            <span id="totalSupply" class="font-mono text-[9px] font-bold text-primary-text uppercase italic">0</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="font-mono text-[7px] text-muted-text font-bold uppercase">CONTRACT CA</span>
                            <div class="flex items-center gap-2 bg-primary p-1.5 border border-secondary shadow-inner">
                                <code id="caAddr" class="text-[9px] font-mono text-soft-success flex-1 uppercase truncate tracking-tight">paxi...</code>
                                <button id="copy-ca-btn" class="text-soft-warning hover:scale-110 transition-transform"><i class="fas fa-copy text-xs"></i></button>
                            </div>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">MINTING</span>
                            <span id="minterStatus" class="font-display text-sm text-soft-success uppercase italic">LOCKED</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[8px] text-muted-text font-bold uppercase">VERIFIED</span>
                            <span id="verifyStatus" class="font-display text-sm text-accent uppercase italic">OFFICIAL</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Token Details (Desc & Marketing) -->
            <div id="tokenDetailsCard" class="px-3 md:px-4 pb-4 hidden">
                <div class="bg-secondary border border-secondary p-4 shadow-brutal">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="text-lg font-display text-accent mb-2 italic uppercase tracking-tighter">ABOUT</h4>
                            <p id="tokenDesc" class="font-mono text-[9px] text-muted-text leading-relaxed uppercase italic">NO DESCRIPTION AVAILABLE.</p>
                        </div>
                        <div>
                            <h4 class="text-lg font-display text-soft-warning mb-2 italic uppercase tracking-tighter">MARKETING</h4>
                            <div class="flex items-center gap-2 bg-secondary p-2 border border-secondary">
                                <code id="mktAddr" class="text-[10px] font-mono text-muted-text break-all flex-1 uppercase tracking-tighter italic">N/A</code>
                                <button id="copy-mkt-btn" class="text-soft-warning hover:scale-110 transition-transform"><i class="fas fa-copy text-sm"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Section (Holders) -->
            <div class="px-2 md:px-3 pb-16">
                <div class="flex gap-1.5 mb-3">
                    <button id="tab-holders" class="tab-btn active px-4 py-1.5 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase tracking-tight">Top Holders</button>
                </div>
                <div id="tabContent" class="bg-secondary border border-secondary shadow-minimal min-h-[150px] overflow-hidden">
                    <!-- Table goes here -->
                </div>
            </div>

            <!-- Global Feature Lock Overlay -->
            <div id="featureLockOverlay" class="hidden fixed inset-0 bg-secondary/60 z-[9999] backdrop-blur-md"></div>

            <!-- Transaction Loader -->
            <div id="txLoader" class="hidden fixed inset-0 bg-secondary/90 z-[30000] flex items-center justify-center">
                <div class="text-center">
                    <div class="w-16 h-16 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-minimal"></div>
                    <h3 class="text-3xl font-display uppercase italic tracking-tighter text-primary-text animate-glitch leading-none">SENDING...</h3>
                    <p class="font-mono text-[8px] text-soft-success font-bold uppercase mt-3 tracking-widest italic">WRITING TO BLOCKS</p>
                </div>
            </div>
        `,
        postRender: (container) => {
            container.querySelector('#aiBtn')?.addEventListener('click', () => window.showAIAnalysis());
            container.querySelectorAll('#chart-controls .tf-btn').forEach(btn => {
                btn.addEventListener('click', (e) => window.setTimeframe(btn.dataset.tf, e.currentTarget));
            });
            container.querySelector('#toggleMA7')?.addEventListener('click', () => window.toggleMA(7));
            container.querySelector('#toggleMA25')?.addEventListener('click', () => window.toggleMA(25));
            container.querySelector('#copy-ca-btn')?.addEventListener('click', () => window.copyAddrText());
            container.querySelector('#copy-mkt-btn')?.addEventListener('click', () => window.copyMktAddr());
            container.querySelector('#tab-holders')?.addEventListener('click', () => window.setTab('holders'));
        }
    };
});

window.UIManager.register('landingMain', () => {
    return {
        html: `
            <!-- Hero Section -->
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

        <!-- Event Banner -->
        <section class="py-10 bg-meme-pink border-y-4 border-card relative overflow-hidden px-4">
            <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle,#000_1px,transparent_1px)] bg-[length:15px_15px]"></div>
            <div class="max-w-7xl mx-auto relative z-10 text-center">
                <div class="inline-block px-4 py-1 bg-surface text-primary-text font-display text-base uppercase italic rotate-[-1deg] mb-6">Live Competition (coming soon)</div>
                <h2 class="text-3xl md:text-6xl font-display text-primary-text italic uppercase tracking-tighter mb-8 drop-shadow-[4px_4px_0_rgba(11,12,13,1)]">Trading War</h2>

                <div class="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                    <div class="bg-surface border-2 border-card p-4 shadow-brutal rotate-[-2deg]">
                        <div class="text-meme-yellow font-display text-3xl italic uppercase mb-1">?k PAXI & CNX</div>
                        <div class="text-primary-text font-mono text-[8px] font-black uppercase tracking-widest italic">Prize Pool</div>
                    </div>
                    <div class="bg-white border-2 border-card p-6 shadow-brutal rotate-[1deg]">
                        <div class="text-black font-display text-3xl italic uppercase mb-1">0</div>
                        <div class="text-black font-mono text-[8px] font-black uppercase tracking-widest italic">Participants</div>
                    </div>
                    <div class="bg-meme-green border-2 border-card p-6 shadow-brutal rotate-[-1deg]">
                        <div class="text-black font-display text-3xl italic uppercase mb-1">?? : ??</div>
                        <div class="text-black font-mono text-[8px] font-black uppercase tracking-widest italic">Time Left</div>
                    </div>
                </div>

                <button class="bg-white text-black font-display text-2xl px-8 py-3 border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">JOIN NOW</button>
            </div>
        </section>

            <!-- Market Section -->
            <section id="market" class="py-12 bg-bg px-4">
                <div class="max-w-7xl mx-auto">
                    <div class="flex flex-col lg:flex-row justify-between items-end gap-6 mb-10 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <div class="max-w-xl">
                            <h2 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter mb-3 drop-shadow-[4px_4px_0_rgba(0,255,159,1)]">Market Radar</h2>
                            <p class="font-mono text-secondary-text font-black uppercase tracking-widest text-sm italic">Real-time data on trending tokens.</p>
                        </div>
                        <!-- Filters -->
                        <div class="flex flex-col gap-4">
                            <div class="flex flex-wrap gap-2" id="market-filter-btns">
                                <button data-filter="pumping" class="market-filter-btn px-4 py-2 bg-meme-green border-2 border-card text-black font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Pumping</button>
                                <button data-filter="hot" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Hot</button>
                                <button data-filter="new" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">New</button>
                                <button data-filter="marketcap" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Mcap</button>
                                <button data-filter="gainers" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Gainers</button>
                                <button data-filter="verified" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Verified</button>
                                <button data-filter="nonpump" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Non-PUMP</button>
                            </div>
                            <div id="marketSubTabs" class="hidden flex flex-wrap gap-2 p-3 bg-card border-2 border-card shadow-brutal-sm rotate-[-0.5deg]">
                                <!-- JS Populated -->
                            </div>
                        </div>
                    </div>

                    <!-- Search -->
                    <div class="mb-10 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <div class="relative">
                            <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-meme-cyan text-lg"></i>
                            <input type="text" id="marketSearch" placeholder="SEARCH TOKENS..."
                                   class="w-full pl-14 pr-6 py-4 bg-surface border-4 border-card text-xl font-display outline-none focus:border-meme-pink transition-all text-primary-text placeholder:text-muted-text italic uppercase">
                        </div>
                    </div>

                    <!-- Grid -->
                    <div id="marketGrid" class="grid grid-cols-2 gap-3 md:gap-6 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <!-- JS Populated -->
                        <div class="animate-pulse bg-card border-4 border-card h-64"></div>
                        <div class="animate-pulse bg-card border-4 border-card h-64"></div>
                    </div>

                    <div class="mt-16 text-center reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                        <button id="loadMoreMarket" class="bg-meme-cyan text-black font-display text-3xl px-12 py-5 border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">LOAD MORE</button>
                    </div>
                </div>
            </section>

        <!-- AI Scan Section -->
        <section class="py-16 bg-bg relative px-4">
            <div class="max-w-7xl mx-auto">
                <div class="bg-surface border-4 border-card p-8 relative overflow-hidden reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] group">
                    <div class="absolute -bottom-20 -left-20 w-64 h-64 bg-meme-cyan opacity-10 blur-3xl rounded-full animate-pulse"></div>

                    <div id="index-ai-content" class="relative z-10">
                        <div class="flex items-center gap-6 mb-8">
                            <div class="w-16 h-16 bg-meme-green border-2 border-card shadow-brutal flex items-center justify-center rotate-[-10deg]">
                                <i class="fas fa-brain text-black text-3xl animate-pulse"></i>
                            </div>
                            <div>
                                <h3 class="font-display italic uppercase text-4xl text-primary-text tracking-tighter mb-1">Network Oracle</h3>
                                <p class="font-mono text-meme-cyan font-black uppercase tracking-widest text-[10px] animate-glitch">GEMINI PRO 1.5 DEEP SCAN ACTIVE</p>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                            <div class="h-20 bg-surface border-2 border-card p-4 animate-pulse"></div>
                        </div>
                        <div class="bg-surface border-2 border-card p-8 h-40 relative overflow-hidden flex items-center justify-center">
                            <div class="absolute inset-0 bg-meme-green/5 animate-pulse"></div>
                            <div class="relative z-10 font-mono text-muted-text font-bold uppercase tracking-widest text-xs italic">Awaiting block intelligence...</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Feature Section -->
        <section class="py-16 bg-meme-yellow border-y-4 border-card px-4">
            <div class="max-w-7xl mx-auto">
                <div class="text-center mb-16 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <h2 class="text-4xl font-display text-black italic uppercase tracking-tighter leading-none mb-4 drop-shadow-[4px_4px_0_rgba(255,255,255,1)]">Degen Protocols</h2>
                    <p class="font-mono text-black font-black uppercase tracking-widest text-sm italic">Cutting-edge tech for bottom-feeding traders.</p>
                </div>

                <div class="grid md:grid-cols-3 gap-6">
                    <div class="reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] p-6 bg-surface border-4 border-card shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        <div class="w-12 h-12 bg-meme-green border-2 border-card flex items-center justify-center text-black text-xl mb-6"><i class="fas fa-bolt"></i></div>
                        <h4 class="text-3xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">Speed</h4>
                        <p class="font-mono text-secondary-text text-[10px] font-bold uppercase tracking-wide leading-relaxed italic">Paxi Network native settlement. Front-run the rugs with sub-second execution latency.</p>
                    </div>
                    <div class="reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)] p-6 bg-surface border-4 border-card shadow-brutal hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all delay-[100ms]">
                        <div class="w-12 h-12 bg-meme-pink border-2 border-card flex items-center justify-center text-primary-text text-xl mb-6"><i class="fas fa-brain"></i></div>
                        <h4 class="text-3xl font-display text-primary-text mb-4 italic uppercase tracking-tighter">AI Oracle</h4>
                        <p class="font-mono text-secondary-text text-[10px] font-bold uppercase tracking-wide leading-relaxed italic">Gemini AI scanning every transaction. Real-time alpha from pure noise.</p>
                    </div>
                </div>
            </div>
            </section>
        `,
        postRender: (container) => {
            container.querySelectorAll('#market-filter-btns button').forEach(btn => {
                btn.addEventListener('click', (e) => window.setMarketFilter(btn.dataset.filter, e.currentTarget));
            });
            container.querySelector('#marketSearch')?.addEventListener('input', () => window.filterMarket());
            container.querySelector('#loadMoreMarket')?.addEventListener('click', () => window.loadMoreMarket());
        }
    };
});
