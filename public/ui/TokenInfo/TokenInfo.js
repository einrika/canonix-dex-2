export const TokenInfoUI = () => {
    return `
        <div class="bg-secondary border border-secondary p-3 shadow-minimal h-full">
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
    `;
};
