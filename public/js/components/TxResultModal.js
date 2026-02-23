// ============================================
// TXRESULTMODAL COMPONENT (ES Module)
// ============================================

export const TxResultModal = {
    render: () => {
        return `
            <div id="txResultModal" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80000] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-sm shadow-brutal p-8 animate-slide-up relative">
                    <div id="txResultIcon" class="w-20 h-20 rounded-full border-4 border-card flex items-center justify-center mx-auto mb-6 shadow-brutal-sm">
                        <!-- Icon injected -->
                    </div>
                    <div class="text-center mb-8">
                        <h2 id="txResultStatus" class="font-display text-4xl italic uppercase tracking-tighter mb-2">Success</h2>
                        <p id="txResultType" class="font-mono text-[10px] text-muted-text uppercase tracking-widest font-bold italic">Transaction Details</p>
                    </div>
                    <div class="space-y-4 bg-card/30 p-4 border-2 border-card">
                        <div class="flex justify-between items-center text-[10px] font-mono">
                            <span class="text-muted-text uppercase">Time</span>
                            <span id="txResultTime" class="text-primary-text font-bold">--:--:--</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] font-mono">
                            <span class="text-muted-text uppercase">Type</span>
                            <span id="logType" class="text-primary-text font-bold">--</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] font-mono">
                            <span class="text-muted-text uppercase">Asset</span>
                            <span id="logAsset" class="text-meme-cyan font-bold">--</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px] font-mono border-t border-card pt-2">
                            <span class="text-muted-text uppercase">Amount</span>
                            <span id="logAmount" class="text-primary-text font-bold">0.00</span>
                        </div>
                    </div>
                    <button id="closeTxResult" class="w-full mt-8 py-3 bg-secondary text-primary-text font-display text-xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">Dismiss Terminal</button>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeTxResult')?.addEventListener('click', () => {
            container.querySelector('#txResultModal').classList.add('hidden');
            container.querySelector('#txResultModal').classList.remove('flex');
        });
    }
};
