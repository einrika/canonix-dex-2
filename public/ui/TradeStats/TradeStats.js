export const TradeStatsUI = () => {
    return `
        <div class="bg-secondary border border-secondary p-3 shadow-minimal h-full">
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
    `;
};
