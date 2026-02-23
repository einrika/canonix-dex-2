export const MarketRadarUI = () => {
    return `
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
    `;
};
