window.UIManager.registerLogic('PINSheet', (container) => {
    container.querySelectorAll('#pin-keypad button[data-val]').forEach(btn => {
        btn.addEventListener('click', () => window.pressPin(btn.dataset.val));
    });
    container.querySelector('#bio-auth-btn')?.addEventListener('click', () => window.authenticateBiometric());
    container.querySelector('#pin-backspace')?.addEventListener('click', () => window.backspacePin());
    container.querySelector('#abort-pin')?.addEventListener('click', () => window.hidePinSheet());
});
