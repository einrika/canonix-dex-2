// ============================================
// WALLET SWITCHER LOGIC
// ============================================

import { State } from '../core/state.js';
import { wallets } from '../wallet-section/wallet-core.js';
import { shortenAddress } from '../core/utils.js';

export const WalletSwitcherLogic = (container) => {
    const modal = container.querySelector('#walletSwitcherModal');
    const listContainer = container.querySelector('#walletListContainer');

    const renderList = () => {
        const allWallets = wallets.getWallets();
        const active = wallets.getActiveWallet();

        if (listContainer) {
            listContainer.innerHTML = allWallets.map(w => `
                <button data-id="${w.id}" class="w-full flex items-center justify-between p-4 ${w.id === active?.id ? 'bg-meme-green text-black' : 'bg-meme-surface text-white'} border-2 border-black shadow-brutal-sm hover:shadow-none transition-all group">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 ${w.id === active?.id ? 'bg-black text-meme-green' : 'bg-meme-pink text-white'} border-2 border-black flex items-center justify-center text-xs group-hover:rotate-12 transition-transform">
                            <i class="fas fa-wallet"></i>
                        </div>
                        <div class="text-left">
                            <div class="text-base font-display uppercase italic tracking-tighter leading-none">${w.name}</div>
                            <div class="font-mono text-[7px] ${w.id === active?.id ? 'text-black/60' : 'text-gray-500'} font-bold">${shortenAddress(w.address)}</div>
                        </div>
                    </div>
                </button>
            `).join('');

            listContainer.querySelectorAll('[data-id]').forEach(btn => {
                btn.addEventListener('click', () => {
                    wallets.setActiveWallet(btn.dataset.id);
                    modal?.classList.add('hidden');
                });
            });
        }
    };

    window.addEventListener('paxi_show_wallet_switcher', () => {
        modal?.classList.remove('hidden');
        renderList();
    });

    container.querySelector('#closeWalletSwitcher')?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });
};
