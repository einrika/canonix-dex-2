export const TradeHeaderStatsUI = () => {
    return `
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
    `;
};
