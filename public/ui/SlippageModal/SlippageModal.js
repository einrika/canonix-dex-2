export const SlippageModalUI = (props) => {
    return `
        <div id="slippageModal" class="hidden fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-2 border-black shadow-brutal w-full max-w-xs">
                <div class="p-3 border-b-2 border-black bg-meme-yellow flex justify-between items-center">
                    <span class="font-display text-lg text-black uppercase italic">SLIPPAGE SETTINGS</span>
                    <button id="closeSlippage" class="text-black"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-4 space-y-4">
                    <div class="grid grid-cols-4 gap-2">
                        ${[0.5, 1.0, 3.0, 5.0].map(s => `<button data-slip="${s}" class="slip-btn py-2 bg-black border border-black text-white font-mono text-[10px] hover:bg-meme-green hover:text-black transition-all">${s}%</button>`).join('')}
                    </div>
                    <input type="number" id="customSlippage" placeholder="CUSTOM %" class="w-full p-2 bg-black border border-black text-white font-mono text-xs outline-none focus:border-meme-green uppercase italic">
                    <button id="saveSlippage" class="w-full py-3 bg-meme-green text-black font-display text-xl border-2 border-black shadow-brutal-sm hover:shadow-none transition-all uppercase italic">SAVE SETTINGS</button>
                </div>
            </div>
        </div>
    `;
};
