export const PINSheetUI = (props) => {
    return `
        <div id="pinSheet" class="hidden fixed inset-0 bg-black/95 z-[500] flex items-center justify-center p-4">
            <div class="bg-meme-surface border-4 border-black shadow-brutal w-full max-w-sm overflow-hidden animate-slide-up">
                <div class="p-6 text-center border-b-4 border-black bg-meme-yellow">
                    <h3 id="pinSheetTitle" class="text-3xl font-display text-black italic uppercase tracking-tighter">Enter Security PIN</h3>
                </div>
                <div class="p-8">
                    <div id="pinDisplay" class="flex justify-center gap-4 mb-10">
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                        <div class="w-4 h-4 rounded-full border-2 border-black bg-black/20"></div>
                    </div>
                    <div id="pinPad" class="grid grid-cols-3 gap-4">
                        ${[1,2,3,4,5,6,7,8,9].map(n => `<button data-key="${n}" class="pin-btn py-5 bg-black border-2 border-black text-white font-display text-3xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all active:bg-meme-green active:text-black italic">${n}</button>`).join('')}
                        <button id="pinCancel" class="py-5 bg-meme-pink border-2 border-black text-white font-display text-xl shadow-brutal-sm hover:shadow-none transition-all italic">CANCEL</button>
                        <button data-key="0" class="pin-btn py-5 bg-black border-2 border-black text-white font-display text-3xl shadow-brutal-sm hover:shadow-none transition-all italic">0</button>
                        <button id="pinBack" class="py-5 bg-meme-cyan border-2 border-black text-black font-display text-xl shadow-brutal-sm hover:shadow-none transition-all italic"><i class="fas fa-backspace"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
