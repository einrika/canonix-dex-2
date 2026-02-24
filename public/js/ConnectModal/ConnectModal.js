// ============================================
// CONNECT MODAL LOGIC
// ============================================

import { State } from '../core/state.js';

export const ConnectModalLogic = (container) => {
    const modal = container.querySelector('#connectModal');

    window.addEventListener('paxi_show_connect_modal', () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });

    container.querySelector('#closeConnectModal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
    });

    container.querySelector('#connect-internal')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
        modal?.classList.remove('flex');
        window.dispatchEvent(new CustomEvent('paxi_show_internal_wallet'));
    });

    container.querySelector('#connect-keplr')?.addEventListener('click', async () => {
        if (!window.keplr) {
            alert('Keplr not installed');
            return;
        }
        try {
            const chainId = 'paxi-mainnet';
            await window.keplr.enable(chainId);
            const offlineSigner = window.keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();

            State.set('wallet', {
                address: accounts[0].address,
                signer: offlineSigner,
                type: 'keplr'
            });
            State.set('walletType', 'keplr');
            modal?.classList.add('hidden');
            modal?.classList.remove('flex');
        } catch (e) {
            console.error(e);
        }
    });
};
