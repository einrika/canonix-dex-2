export const TxConfirmModalUI = (props) => {
    return `
        <div id="txConfirmModal" class="hidden fixed inset-0 bg-black/95 z-[700] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-sm overflow-hidden animate-slide-up">
                <div class="p-6 text-center border-b-4 border-black bg-meme-cyan">
                    <h3 class="text-3xl font-display text-black italic uppercase tracking-tighter">Confirm Transaction</h3>
                </div>
                <div id="txConfirmContent" class="p-8 space-y-6"></div>
                <div class="p-4 border-t-2 border-black flex gap-3">
                    <button id="cancelTx" class="flex-1 py-4 bg-meme-pink text-white font-display text-2xl border-2 border-black shadow-brutal hover:shadow-none transition-all uppercase italic">CANCEL</button>
                    <button id="confirmTx" class="flex-1 py-4 bg-meme-green text-black font-display text-2xl border-2 border-black shadow-brutal hover:shadow-none transition-all uppercase italic">CONFIRM</button>
                </div>
            </div>
        </div>
    `;
};
