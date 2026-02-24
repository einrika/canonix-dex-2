window.UIManager.registerUI('TxConfirmModal', () => {
    return `
        <div id="txConfirmModal" class="hidden fixed inset-0 bg-primary/98 z-[70000] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary w-full max-w-[280px] rounded-[1.5rem] p-5 animate-slide-up shadow-minimal">
                <div class="text-center mb-4">
                    <div class="w-10 h-10 bg-soft-success border border-secondary shadow-brutal-sm flex items-center justify-center mx-auto mb-3 rotate-[-5deg]">
                        <i class="fas fa-shield-check text-xl text-black"></i>
                    </div>
                    <h3 class="text-xl font-display uppercase tracking-tight mb-1 text-primary-text leading-none">CONFIRM</h3>
                    <p id="txConfirmMsg" class="font-mono text-[6px] text-muted-text uppercase font-bold tracking-widest">VERIFY ACTION</p>
                </div>

                <div class="space-y-2.5 bg-primary border border-secondary p-3 mb-5 shadow-inner">
                    <div class="flex justify-between items-center gap-2">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text shrink-0">ACTION</span>
                        <span id="txConfirmAction" class="font-display text-sm italic text-accent uppercase truncate text-right">--</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">NET</span>
                        <span id="txConfirmNetwork" class="font-display text-sm text-soft-warning italic tracking-tight">PAXI NET</span>
                    </div>
                    <div id="txConfirmFeeRow" class="flex justify-between items-center pt-2 border-t border-secondary">
                        <span class="font-mono text-[6px] uppercase font-bold text-muted-text">FEE</span>
                        <span id="txConfirmFee" class="font-mono text-[9px] font-bold text-soft-success">--</span>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2">
                    <button id="txCancelBtn" class="py-2.5 bg-primary border border-secondary text-muted-text font-display text-base uppercase hover:text-primary-text transition-all shadow-brutal-sm hover:shadow-none">Abort</button>
                    <button id="txConfirmBtn" class="py-2.5 bg-soft-success text-black font-display text-base uppercase border border-secondary shadow-brutal-sm hover:shadow-none">CONFIRM</button>
                </div>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('TxConfirmModal', (container) => {
    // Logic for confirm and cancel is typically attached when the modal is shown
    // but we ensure the elements exist.
});
