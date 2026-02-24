window.UIManager.registerUI('SlippageModal', () => {
    return `
        <div id="slippageModal" class="hidden fixed inset-0 bg-primary/95 z-[400] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-[240px] overflow-hidden">
                <div class="p-2.5 border-b border-secondary flex justify-between items-center bg-soft-warning">
                    <h3 class="font-display text-lg text-black uppercase">SLIPPAGE</h3>
                    <button id="close-slippage-modal" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-base"></i></button>
                </div>
                <div class="p-3 space-y-3 bg-primary">
                    <div class="grid grid-cols-2 gap-1.5" id="slippage-presets">
                        <button data-val="0.1" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">0.1%</button>
                        <button data-val="0.5" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">0.5%</button>
                        <button data-val="1.0" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">1.0%</button>
                        <button data-val="30.0" class="py-1.5 bg-secondary border border-secondary text-primary-text font-display text-xs shadow-brutal-sm hover:shadow-none transition-all uppercase">30.0%</button>
                    </div>
                    <div class="relative">
                        <input type="number" id="customSlippage" placeholder="CUSTOM" class="w-full pl-3 pr-8 py-2 bg-secondary border border-secondary text-primary-text font-display text-lg outline-none focus:border-accent placeholder:text-muted-text uppercase">
                        <span class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-text font-display text-lg italic">%</span>
                    </div>
                    <button id="save-slippage" class="w-full py-2.5 bg-accent text-black font-display text-xl border border-secondary shadow-brutal hover:shadow-none transition-all uppercase">Save</button>
                </div>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('SlippageModal', (container) => {
    container.querySelector('#close-slippage-modal')?.addEventListener('click', () => window.addClass('slippageModal', 'hidden'));
    container.querySelectorAll('#slippage-presets button').forEach(btn => {
        btn.addEventListener('click', () => window.setSlippage(parseFloat(btn.dataset.val)));
    });
    container.querySelector('#customSlippage')?.addEventListener('input', () => window.updateCustomSlippage());
    container.querySelector('#save-slippage')?.addEventListener('click', () => window.addClass('slippageModal', 'hidden'));
});
