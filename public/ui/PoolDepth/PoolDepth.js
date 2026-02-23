export const PoolDepthUI = () => {
    return `
        <div class="bg-secondary border border-secondary p-3 shadow-minimal h-full">
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
    `;
};
