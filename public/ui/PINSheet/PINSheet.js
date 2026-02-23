export const PINSheetUI = () => {
    return `
        <div id="pinSheet" class="hidden fixed inset-0 z-[200000] flex items-center justify-center p-4">
            <div class="absolute inset-0 bg-bg/95 backdrop-blur-xl" onclick="window.hidePINSheet()"></div>
            <div class="relative w-full max-w-sm bg-secondary border-4 border-card shadow-brutal-lg p-8 animate-slide-up">
                <div class="text-center mb-8">
                    <div class="w-16 h-16 bg-bg border-4 border-card shadow-brutal mx-auto mb-6 flex items-center justify-center rotate-[-5deg]">
                        <i class="fas fa-shield-halved text-meme-green text-3xl"></i>
                    </div>
                    <h3 id="pinSheetTitle" class="text-3xl font-display text-primary-text italic uppercase">Identity Check</h3>
                    <p id="pinSheetDesc" class="font-mono text-[8px] text-muted-text uppercase font-bold mt-2">Authorization required for decryption</p>
                </div>

                <div class="flex justify-center gap-3 mb-8" id="pinDisplay">
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                    <div class="w-12 h-16 bg-bg border-2 border-card flex items-center justify-center text-3xl font-display text-meme-green shadow-brutal-sm">•</div>
                </div>

                <div class="grid grid-cols-3 gap-4" id="pinPad">
                    <button data-key="1" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">1</button>
                    <button data-key="2" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">2</button>
                    <button data-key="3" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">3</button>
                    <button data-key="4" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">4</button>
                    <button data-key="5" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">5</button>
                    <button data-key="6" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">6</button>
                    <button data-key="7" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">7</button>
                    <button data-key="8" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">8</button>
                    <button data-key="9" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">9</button>
                    <button onclick="window.hidePINSheet()" class="p-5 text-muted-text hover:text-meme-pink transition-colors"><i class="fas fa-times"></i></button>
                    <button data-key="0" class="pin-btn p-5 bg-bg border-2 border-card font-display text-2xl shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">0</button>
                    <button id="pinBack" class="p-5 text-muted-text hover:text-meme-yellow transition-colors"><i class="fas fa-backspace"></i></button>
                </div>

                <div class="mt-8 flex justify-center">
                    <p class="font-mono text-[7px] text-muted-text uppercase font-black tracking-widest text-center max-w-[200px]">6-digit encryption sequence required to access private memory cells.</p>
                </div>
            </div>
        </div>
    `;
};
