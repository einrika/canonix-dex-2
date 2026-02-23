window.UIManager.registerLogic('SlippageModal', (container) => {
    container.querySelector('#close-slippage-modal')?.addEventListener('click', () => window.addClass('slippageModal', 'hidden'));
    container.querySelectorAll('#slippage-presets button').forEach(btn => {
        btn.addEventListener('click', () => window.setSlippage(parseFloat(btn.dataset.val)));
    });
    container.querySelector('#customSlippage')?.addEventListener('input', () => window.updateCustomSlippage());
    container.querySelector('#save-slippage')?.addEventListener('click', () => window.addClass('slippageModal', 'hidden'));
});
