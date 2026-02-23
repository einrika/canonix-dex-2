// ============================================
// SLIPPAGEMODAL COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';

export const SlippageModal = {
    render: () => {
        return `
            <div id="slippageModal" class="fixed inset-0 bg-black/80 backdrop-blur-md z-[2000] hidden items-center justify-center p-4">
                <div class="bg-surface border-4 border-card w-full max-w-sm shadow-brutal p-8 animate-slide-up relative">
                    <button id="closeSlippage" class="absolute top-4 right-4 text-muted-text hover:text-primary-text">
                        <i class="fas fa-times text-xl"></i>
                    </button>

                    <div class="text-center mb-8">
                        <div class="w-16 h-16 bg-meme-yellow border-4 border-card shadow-brutal flex items-center justify-center mx-auto mb-4 rotate-[-5deg]">
                            <i class="fas fa-sliders-h text-black text-2xl"></i>
                        </div>
                        <h2 class="font-display text-3xl italic uppercase tracking-tighter">Trade <span class="text-meme-yellow">Parameters</span></h2>
                        <p class="font-mono text-[10px] text-muted-text mt-2 uppercase tracking-widest font-bold">Execution Tolerance</p>
                    </div>

                    <div class="space-y-6">
                        <div>
                            <div class="flex justify-between text-[10px] font-mono uppercase mb-2">
                                <span class="text-muted-text">Max Slippage</span>
                                <span id="slipValDisplay" class="text-meme-cyan font-bold">0.5%</span>
                            </div>
                            <div class="grid grid-cols-4 gap-2">
                                ${[0.1, 0.5, 1.0, 5.0].map(s => `<button class="slip-btn py-2 bg-card border-2 border-card font-mono text-[10px] hover:border-meme-cyan transition-all" data-val="${s}">${s}%</button>`).join('')}
                            </div>
                        </div>

                        <div class="pt-6 border-t-2 border-card">
                            <label class="flex items-center justify-between cursor-pointer group">
                                <div class="space-y-1">
                                    <div class="font-display text-lg uppercase italic group-hover:text-primary-text transition-colors text-muted-text">Safe Mode</div>
                                    <div class="font-mono text-[8px] uppercase font-bold text-muted-text/50">Restrict high impact trades</div>
                                </div>
                                <input type="checkbox" class="hidden peer" checked>
                                <div class="w-12 h-6 bg-card border-2 border-card relative rounded-full transition-all peer-checked:bg-meme-green">
                                    <div class="absolute top-1 left-1 w-2 h-2 bg-muted-text rounded-full transition-all peer-checked:left-7 peer-checked:bg-black"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#closeSlippage')?.addEventListener('click', () => {
            container.querySelector('#slippageModal').classList.add('hidden');
        });

        container.querySelectorAll('.slip-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.dataset.val;
                State.set('slippage', parseFloat(val));
                container.querySelector('#slipValDisplay').textContent = `${val}%`;
            });
        });
    }
};
