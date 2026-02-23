// ============================================
// PINSHEET COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';

export const PINSheet = {
    render: () => {
        return `
            <div id="pinSheet" class="fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] hidden items-end md:items-center justify-center">
                <div class="bg-surface border-t-4 md:border-4 border-card w-full max-w-md shadow-brutal p-6 md:p-8 animate-slide-up relative">
                    <button id="closePIN" class="absolute top-4 right-4 text-muted-text hover:text-primary-text transition-colors">
                        <i class="fas fa-times text-xl"></i>
                    </button>

                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-meme-pink border-4 border-card shadow-brutal flex items-center justify-center mx-auto mb-4 rotate-[5deg]">
                            <i class="fas fa-lock text-white text-2xl"></i>
                        </div>
                        <h2 class="font-display text-3xl italic uppercase tracking-tighter">Identity <span class="text-meme-pink">Verify</span></h2>
                        <p id="pinInstructions" class="font-mono text-[10px] text-muted-text mt-2 uppercase tracking-widest font-bold italic">Enter Security PIN to Unlock Terminal</p>
                    </div>

                    <div class="flex justify-center gap-3 mb-8">
                        <input type="password" maxlength="1" class="pin-input w-12 h-16 bg-card border-4 border-card text-center text-3xl font-display text-meme-pink focus:border-meme-pink outline-none shadow-brutal-sm transition-all" readonly>
                        <input type="password" maxlength="1" class="pin-input w-12 h-16 bg-card border-4 border-card text-center text-3xl font-display text-meme-pink focus:border-meme-pink outline-none shadow-brutal-sm transition-all" readonly>
                        <input type="password" maxlength="1" class="pin-input w-12 h-16 bg-card border-4 border-card text-center text-3xl font-display text-meme-pink focus:border-meme-pink outline-none shadow-brutal-sm transition-all" readonly>
                        <input type="password" maxlength="1" class="pin-input w-12 h-16 bg-card border-4 border-card text-center text-3xl font-display text-meme-pink focus:border-meme-pink outline-none shadow-brutal-sm transition-all" readonly>
                    </div>

                    <div class="grid grid-cols-3 gap-3">
                        ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-btn h-14 bg-card border-2 border-card font-display text-2xl italic hover:bg-meme-pink hover:text-white transition-all shadow-brutal-sm active:shadow-none translate-x-0 active:translate-x-0.5 active:translate-y-0.5">${n}</button>`).join('')}
                        <button class="pin-btn-clear h-14 bg-surface border-2 border-card font-display text-sm uppercase italic hover:bg-muted-text hover:text-black transition-all shadow-brutal-sm">Clear</button>
                        <button class="pin-btn h-14 bg-card border-2 border-card font-display text-2xl italic hover:bg-meme-pink hover:text-white transition-all shadow-brutal-sm active:shadow-none translate-x-0 active:translate-x-0.5 active:translate-y-0.5">0</button>
                        <button class="pin-btn-del h-14 bg-surface border-2 border-card font-display text-sm uppercase italic hover:bg-muted-text hover:text-black transition-all shadow-brutal-sm"><i class="fas fa-backspace"></i></button>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        let currentPIN = '';
        const inputs = container.querySelectorAll('.pin-input');

        const updateInputs = () => {
            inputs.forEach((input, i) => {
                input.value = currentPIN[i] || '';
                input.classList.toggle('border-meme-pink', !!currentPIN[i]);
            });
        };

        container.querySelectorAll('.pin-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (currentPIN.length < 4) {
                    currentPIN += btn.textContent;
                    updateInputs();
                    if (currentPIN.length === 4) {
                        // Notify PIN entered
                        window.dispatchEvent(new CustomEvent('pin_entered', { detail: currentPIN }));
                        currentPIN = '';
                        setTimeout(updateInputs, 200);
                    }
                }
            });
        });

        container.querySelector('.pin-btn-clear')?.addEventListener('click', () => {
            currentPIN = '';
            updateInputs();
        });

        container.querySelector('.pin-btn-del')?.addEventListener('click', () => {
            currentPIN = currentPIN.slice(0, -1);
            updateInputs();
        });

        container.querySelector('#closePIN')?.addEventListener('click', () => {
            container.querySelector('#pinSheet').classList.add('hidden');
            container.querySelector('#pinSheet').classList.remove('flex');
        });
    }
};
