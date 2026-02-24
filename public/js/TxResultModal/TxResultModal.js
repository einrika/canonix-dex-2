// ============================================
// TX RESULT MODAL LOGIC
// ============================================

export const TxResultModalLogic = (container) => {
    const modal = container.querySelector('#txResultModal');

    window.addEventListener('paxi_show_tx_result', (e) => {
        const data = e.detail;
        if (!modal) return;

        const isSuccess = data.status === 'success';
        const titleEl = container.querySelector('#txResultTitle');
        const iconEl = container.querySelector('#txResultIcon');

        if (titleEl) titleEl.textContent = isSuccess ? 'Transaction Successful' : 'Transaction Failed';
        if (iconEl) {
            iconEl.innerHTML = isSuccess ?
                '<i class="fas fa-check-circle text-6xl text-meme-green"></i>' :
                '<i class="fas fa-times-circle text-6xl text-meme-pink"></i>';
        }

        container.querySelector('#txResultType').textContent = data.type || '--';
        container.querySelector('#txResultAsset').textContent = data.asset || '--';
        container.querySelector('#txResultAmount').textContent = data.amount || '--';

        const hashContainer = container.querySelector('#txResultHashContainer');
        const hashEl = container.querySelector('#txResultHash');
        if (data.hash && hashContainer && hashEl) {
            hashContainer.classList.remove('hidden');
            hashEl.textContent = data.hash;
        } else if (hashContainer) {
            hashContainer.classList.add('hidden');
        }

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });

    container.querySelector('#closeTxResultBtn')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });
};
