window.UIManager.registerUI('TxResultModal', () => {
    return `
        <div id="txResultModal" class="hidden fixed inset-0 bg-primary/98 z-[80000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-xs rounded-[1.5rem] p-5 animate-slide-up overflow-y-auto max-h-[85vh] shadow-minimal no-scrollbar text-center">
                <div id="txResultIcon" class="w-12 h-12 border border-secondary shadow-brutal-sm flex items-center justify-center mx-auto mb-3 rotate-[5deg]">
                </div>
                <h3 id="txResultStatus" class="text-2xl font-display uppercase tracking-tight mb-1 leading-none">STATUS</h3>
                <div id="txResultType" class="font-mono text-[6px] font-bold uppercase tracking-widest text-muted-text italic mb-4">LOG</div>

                <div class="space-y-2 bg-primary border border-secondary p-3 mb-5 shadow-inner text-left">
                    <div class="flex justify-between items-center border-b border-secondary pb-1.5 mb-1.5">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">TIME</span>
                        <span id="txResultTime" class="font-mono text-[9px] text-accent uppercase">--:--</span>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">TYPE</span>
                            <span id="logType" class="font-display text-sm italic text-primary-text uppercase">--</span>
                        </div>
                        <div class="flex justify-between items-center gap-4">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">ASSET</span>
                            <span id="logAsset" class="font-display text-sm text-soft-warning uppercase text-right truncate">--</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">AMOUNT</span>
                            <span id="logAmount" class="font-mono text-[9px] font-bold text-soft-success">0.00</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text">NETWORK</span>
                            <span id="logNetwork" class="font-display text-sm text-soft-warning italic">PAXI NET</span>
                        </div>
                        <div class="flex flex-col gap-1 mt-1.5">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text text-center">ADDRESS / RECIPIENT</span>
                            <div class="flex items-center gap-1.5 p-1.5 bg-primary border border-secondary">
                                <code id="logAddress" class="font-mono text-[6px] text-muted-text flex-1 truncate uppercase">--</code>
                                <button id="copyAddressBtn" class="text-accent hover:scale-110 transition-all"><i class="fas fa-copy text-[10px]"></i></button>
                            </div>
                        </div>
                        <div class="flex flex-col gap-1 mt-1.5">
                            <span class="font-mono text-[6px] uppercase font-bold text-muted-text text-center">HASH</span>
                            <div class="flex items-center gap-1.5 p-1.5 bg-primary border border-secondary">
                                <code id="logHash" class="font-mono text-[6px] text-muted-text flex-1 truncate uppercase">--</code>
                                <button id="viewHashBtn" class="text-soft-success hover:scale-110 transition-all"><i class="fas fa-external-link-alt text-[10px]"></i></button>
                            </div>
                        </div>
                        <div id="txExtraInfo" class="hidden flex flex-col gap-1.5 pt-1.5 border-t border-secondary mt-1.5">
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-[6px] uppercase font-bold text-muted-text">HEIGHT</span>
                                <span id="logHeight" class="font-mono text-[9px] text-primary-text">--</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <span class="font-mono text-[6px] uppercase font-bold text-muted-text">GAS USED</span>
                                <span id="logGasUsed" class="font-mono text-[9px] text-accent">--</span>
                            </div>
                        </div>
                        <div id="logErrorContainer" class="hidden flex flex-col gap-1">
                            <span class="font-mono text-[6px] uppercase font-bold text-soft-failed text-center">ERROR</span>
                            <div class="p-2 bg-soft-failed/10 border border-soft-failed/30">
                                <p id="logError" class="font-mono text-[6px] text-soft-failed leading-tight font-bold uppercase break-words italic">--</p>
                            </div>
                        </div>
                    </div>
                </div>

                <button id="close-tx-result" class="w-full py-3 bg-primary border border-secondary text-primary-text font-display text-lg uppercase shadow-minimal hover:bg-secondary transition-all">CLOSE</button>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('TxResultModal', (container) => {
    container.querySelector('#close-tx-result')?.addEventListener('click', () => window.closeTxResult());
});
