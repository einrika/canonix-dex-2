export const TradeHeaderStatsUI = (props) => {
    return `
        <div class="px-3 md:px-4 pt-4">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-meme-surface border-2 border-black shadow-brutal p-3 md:p-4 rotate-[-0.2deg]">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 md:w-12 md:h-12 bg-meme-card border-2 border-black shadow-brutal flex items-center justify-center rotate-[-5deg] overflow-hidden">
                        <img id="headerTokenLogo" src="asset/android-icon-48x48.png" class="w-full h-full object-cover">
                    </div>
                    <div>
                        <div class="flex items-center gap-2">
                            <h2 id="selectedPair" class="text-2xl md:text-3xl font-display text-white italic tracking-tighter uppercase">TOKEN/PAXI</h2>
                            <button id="aiBtn" class="px-2 py-0.5 bg-meme-cyan text-black font-display text-[10px] border border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic flex items-center gap-1.5"><i class="fas fa-brain"></i> AI</button>
                        </div>
                        <div class="flex items-center gap-3">
                            <span id="headerPrice" class="text-lg md:text-xl font-mono font-bold text-meme-green">0.00000000 PAXI</span>
                            <span id="headerChange" class="text-xs md:text-sm font-mono font-black text-meme-green">+0.00%</span>
                        </div>
                    </div>
                </div>
                <div class="grid grid-cols-4 md:flex gap-2 md:gap-6 w-full md:w-auto">
                    <div class="text-center md:text-left border-r md:border-r-0 border-gray-800 pr-2 md:pr-0">
                        <div class="text-[7px] md:text-[8px] text-gray-500 font-black uppercase tracking-widest italic">Mcap</div>
                        <div id="headerMcap" class="text-[10px] md:text-xs font-mono font-bold text-white uppercase">0 PAXI</div>
                    </div>
                    <div class="text-center md:text-left border-r md:border-r-0 border-gray-800 pr-2 md:pr-0">
                        <div class="text-[7px] md:text-[8px] text-gray-500 font-black uppercase tracking-widest italic">Liq</div>
                        <div id="headerLiq" class="text-[10px] md:text-xs font-mono font-bold text-meme-cyan uppercase">0 PAXI</div>
                    </div>
                    <div class="text-center md:text-left border-r md:border-r-0 border-gray-800 pr-2 md:pr-0">
                        <div class="text-[7px] md:text-[8px] text-gray-500 font-black uppercase tracking-widest italic">Vol 24h</div>
                        <div id="headerVol" class="text-[10px] md:text-xs font-mono font-bold text-meme-yellow uppercase">0 PAXI</div>
                    </div>
                    <div class="text-center md:text-left">
                        <div class="text-[7px] md:text-[8px] text-gray-500 font-black uppercase tracking-widest italic">Signal</div>
                        <div id="headerSignal" class="text-[10px] md:text-xs font-mono font-black text-meme-green uppercase animate-pulse">NEUTRAL</div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
