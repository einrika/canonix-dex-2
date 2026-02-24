// ============================================
// HEADER LOGIC
// ============================================

import { State } from '../core/state.js';
import { shortenAddress } from '../core/utils.js';

export const HeaderLogic = (container, props) => {
    const isLanding = props.type === 'landing';
    if (isLanding) return;

    const connectBtn = container.querySelector('#connectBtn');
    const walletInfo = container.querySelector('#walletInfo');
    const addrEl = container.querySelector('#walletAddrShort');
    const menuBtn = container.querySelector('#menuBtn');

    const updateWalletUI = (wallet) => {
        if (wallet) {
            connectBtn?.classList.add('hidden');
            walletInfo?.classList.remove('hidden');
            if (addrEl) addrEl.textContent = shortenAddress(wallet.address);
        } else {
            connectBtn?.classList.remove('hidden');
            walletInfo?.classList.add('hidden');
        }
    };

    connectBtn?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_show_connect_modal'));
    });

    menuBtn?.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('paxi_toggle_token_sidebar'));
    });

    updateWalletUI(State.get('wallet'));

    State.subscribe('wallet', (wallet) => {
        updateWalletUI(wallet);
    });
};
