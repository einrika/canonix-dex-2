window.UIManager.registerUI('PINSheet', () => {
    return `
        <div id="pinSheet" class="hidden fixed inset-0 bg-primary/95 z-[100000] flex items-end justify-center">
            <div class="bg-secondary w-full max-w-md border-t-2 border-secondary animate-slide-up flex flex-col p-5 pb-8">
                <div class="w-12 h-1 bg-primary rounded-full mx-auto mb-6 shrink-0"></div>
                <h3 id="pinTitle" class="text-2xl font-display text-center mb-1 uppercase tracking-tight text-accent">Unlock</h3>
                <p id="pinMsg" class="font-mono text-[7px] text-muted-text text-center mb-6 font-bold uppercase tracking-widest">Enter your 6-digit access code</p>

                <!-- Pin Dots -->
                <div id="pinDots" class="flex justify-center gap-3 mb-8 shrink-0">
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                    <div class="pin-dot w-4 h-4 bg-primary border border-secondary shadow-minimal"></div>
                </div>

                <!-- Keypad -->
                <div class="grid grid-cols-3 gap-3 max-w-xs mx-auto" id="pin-keypad">
                    <button data-val="1" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">1</button>
                    <button data-val="2" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">2</button>
                    <button data-val="3" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">3</button>
                    <button data-val="4" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">4</button>
                    <button data-val="5" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">5</button>
                    <button id="pin-bio" class="hidden"></button>
                    <button data-val="6" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">6</button>
                    <button data-val="7" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">7</button>
                    <button data-val="8" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">8</button>
                    <button data-val="9" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">9</button>
                    <button id="bio-auth-btn" class="w-12 h-12 flex items-center justify-center text-accent hover:scale-110 transition-transform"><i class="fas fa-fingerprint text-2xl"></i></button>
                    <button data-val="0" class="w-12 h-12 bg-primary border border-secondary shadow-minimal flex items-center justify-center text-lg font-display hover:bg-accent hover:text-black transition-all">0</button>
                    <button id="pin-backspace" class="w-12 h-12 flex items-center justify-center text-soft-failed hover:scale-110 transition-transform"><i class="fas fa-backspace text-xl"></i></button>
                </div>
                <button id="abort-pin" class="mt-6 font-display text-lg text-muted-text uppercase hover:text-primary-text transition-colors tracking-widest shrink-0">Abort</button>
            </div>
        </div>
    `;
});
