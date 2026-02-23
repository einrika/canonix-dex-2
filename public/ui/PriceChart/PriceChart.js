export const PriceChartUI = () => {
    return `
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
    `;
};
