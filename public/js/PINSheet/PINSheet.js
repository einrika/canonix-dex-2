// ============================================
// PIN SHEET LOGIC
// ============================================

export const PINSheetLogic = (container) => {
    const sheet = container.querySelector('#pinSheet');
    const titleEl = container.querySelector('#pinTitle');
    const dots = container.querySelectorAll('#pinDots div');
    let currentPin = '';
    let currentCallback = null;

    const updateDots = () => {
        dots.forEach((dot, i) => {
            if (i < currentPin.length) {
                dot.classList.remove('bg-gray-700');
                dot.classList.add('bg-meme-cyan');
            } else {
                dot.classList.remove('bg-meme-cyan');
                dot.classList.add('bg-gray-700');
            }
        });
    };

    const pressKey = (n) => {
        if (currentPin.length < 6) {
            currentPin += n;
            updateDots();
            if (currentPin.length === 6) {
                const pin = currentPin;
                setTimeout(() => {
                    hide();
                    if (currentCallback) currentCallback(pin);
                }, 300);
            }
        }
    };

    const hide = () => {
        sheet?.classList.add('hidden');
        sheet?.classList.remove('flex');
        currentPin = '';
    };

    window.addEventListener('paxi_show_pin_sheet', (e) => {
        const { title, callback } = e.detail;
        if (titleEl) titleEl.textContent = title;
        currentCallback = callback;
        currentPin = '';
        updateDots();
        sheet?.classList.remove('hidden');
        sheet?.classList.add('flex');
    });

    container.querySelectorAll('[data-key]').forEach(btn => {
        btn.addEventListener('click', () => pressKey(btn.dataset.key));
    });

    container.querySelector('#pin-backspace')?.addEventListener('click', () => {
        currentPin = currentPin.slice(0, -1);
        updateDots();
    });

    container.querySelector('#pin-close')?.addEventListener('click', hide);
};
