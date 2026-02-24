export const TradeStatsUI = (props) => {
    return `
        <div class="bg-meme-surface border-2 border-black p-4 shadow-brutal rotate-[-0.5deg]">
            <h4 class="text-lg font-display text-meme-green mb-4 flex items-center gap-2 italic uppercase tracking-tighter">
                <i class="fas fa-chart-pie text-sm"></i> TRADE STATS
            </h4>
            <div class="space-y-3">
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">BUYS</span>
                    <span id="buyCount" class="font-display text-xl text-meme-green italic">0</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">SELLS</span>
                    <span id="sellCount" class="font-display text-xl text-meme-pink italic">0</span>
                </div>
                <div class="h-2 w-full bg-black border border-black overflow-hidden flex shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                    <div id="buyRatioBar" class="h-full bg-meme-green w-1/2"></div>
                </div>
                <div class="flex justify-between items-center pt-1.5">
                    <span class="font-mono text-[9px] text-gray-500 font-bold uppercase tracking-widest">TOTAL</span>
                    <span id="txCount" class="font-display text-xl text-white italic">0</span>
                </div>
            </div>
        </div>
    `;
};
