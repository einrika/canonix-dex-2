export const TxResultModalUI = (props) => {
    return `
        <div id="txResultModal" class="hidden fixed inset-0 bg-black/95 z-[800] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-sm overflow-hidden">
                <div class="p-8 text-center" id="txResultIconArea">
                    <div id="txResultIcon" class="w-20 h-20 rounded-full border-4 border-black mx-auto mb-6 flex items-center justify-center shadow-brutal"></div>
                    <h3 id="txResultStatus" class="text-4xl font-display italic uppercase tracking-tighter mb-2"></h3>
                    <p id="txResultType" class="text-gray-500 font-mono text-[10px] font-black uppercase tracking-[0.3em] mb-8"></p>
                    <div id="txResultDetails" class="bg-black border-2 border-black p-4 space-y-2 text-left mb-8"></div>
                    <button id="closeTxResult" class="w-full py-4 bg-white text-black font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none transition-all uppercase italic">AWESOME</button>
                </div>
            </div>
        </div>
    `;
};
