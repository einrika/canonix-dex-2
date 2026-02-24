export const PriceChartUI = (props) => {
    return `
        <div class="px-3 md:px-4 py-3 md:py-4">
            <div class="bg-meme-surface border-2 border-black shadow-brutal overflow-hidden">
                <div class="p-3 border-b-2 border-black flex flex-wrap items-center justify-between gap-3 bg-black">
                    <div class="flex items-center gap-3">
                        <div class="flex gap-1.5 border-r border-gray-800 pr-3">
                            <button data-tf="live" class="tf-btn px-2 py-0.5 bg-meme-green text-black font-display text-[10px] border border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">LIVE</button>
                            <button data-tf="1h" class="tf-btn px-2 py-0.5 bg-black text-white font-display text-[10px] border border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">1H</button>
                            <button data-tf="24h" class="tf-btn px-2 py-0.5 bg-black text-white font-display text-[10px] border border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">24H</button>
                        </div>
                        <div class="flex gap-1.5">
                            <button id="toggleMA7" class="px-2 py-0.5 bg-black text-gray-600 font-display text-[10px] border border-black shadow-brutal-sm hover:text-meme-yellow transition-all uppercase italic">MA7</button>
                            <button id="toggleMA25" class="px-2 py-0.5 bg-black text-gray-600 font-display text-[10px] border border-black shadow-brutal-sm hover:text-meme-pink transition-all uppercase italic">MA25</button>
                        </div>
                    </div>
                    <div id="chartStatus" class="font-mono text-[8px] text-meme-green font-bold uppercase tracking-widest animate-pulse">FEED ACTIVE</div>
                </div>
                <div class="h-[250px] md:h-[400px] w-full relative bg-black" id="chartWrapper">
                    <div id="priceChart" class="w-full h-full"></div>
                </div>
            </div>
        </div>
    `;
};
