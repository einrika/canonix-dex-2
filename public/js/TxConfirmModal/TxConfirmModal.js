// ============================================
// TX CONFIRM MODAL LOGIC
// ============================================

export const TxConfirmModalLogic = (container) => {
    let confirmCallback = null;
    const modal = container.querySelector('#txConfirmModal');

    window.addEventListener('paxi_show_tx_confirm', (e) => {
        const { memo, fee, callback } = e.detail;
        if (!modal) return callback(false);

        container.querySelector('#txConfirmAction').textContent = memo;
        container.querySelector('#txConfirmFee').textContent = fee;

        modal.classList.remove('hidden');
        modal.classList.add('flex');
        confirmCallback = callback;
    });

    container.querySelector('#txConfirmBtn')?.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(true);
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });

    container.querySelector('#txCancelBtn')?.addEventListener('click', () => {
        if (confirmCallback) {
            confirmCallback(false);
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    });
};
