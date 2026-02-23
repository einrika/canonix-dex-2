// ============================================
// TXCONFIRMMODAL COMPONENT (ES Module)
// ============================================

export const TxConfirmModal = {
    render: () => {
        return `
            <div id="txConfirmModal" class="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[70000] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-sm shadow-brutal p-8 animate-slide-up relative">
                    <div class="w-20 h-20 bg-meme-yellow border-4 border-card shadow-brutal flex items-center justify-center mx-auto mb-6 rotate-[-5deg]">
                        <i class="fas fa-file-signature text-black text-3xl"></i>
                    </div>
                    <div class="text-center mb-8">
                        <h2 class="font-display text-4xl italic uppercase tracking-tighter mb-2">Review <span class="text-meme-yellow">Order</span></h2>
                        <p class="font-mono text-[10px] text-muted-text uppercase tracking-widest font-bold italic">Verify On-Chain Intent</p>
                    </div>
                    <div id="confirmDetails" class="space-y-4 bg-card/30 p-5 border-2 border-card font-mono text-[10px]">
                        <!-- Details injected -->
                    </div>
                    <div class="grid grid-cols-2 gap-4 mt-8">
                        <button id="cancelTx" class="py-3 bg-card border-2 border-card font-display text-xl uppercase italic hover:bg-meme-pink hover:text-white transition-all">Cancel</button>
                        <button id="confirmTx" class="py-3 bg-meme-green text-black border-2 border-card font-display text-xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all uppercase italic">Confirm</button>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#cancelTx')?.addEventListener('click', () => {
            container.querySelector('#txConfirmModal').classList.add('hidden');
            container.querySelector('#txConfirmModal').classList.remove('flex');
        });
        // confirmTx handled by global promise or state
    }
};
