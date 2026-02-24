// ============================================
// UNIFIED SIDEBAR LOGIC
// ============================================

import { State } from '../core/state.js';
import { WalletUI } from '../wallet-section/ui-wallet.js';

export const UnifiedSidebarLogic = (container) => {
    const tabs = container.querySelectorAll('[data-tab]');
    const sidebar = container.querySelector('#unifiedSidebar');
    const content = container.querySelector('#sidebarContent');

    const updateActiveTab = (tabName) => {
        tabs.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('bg-meme-green', 'text-black');
                btn.classList.remove('text-gray-500');
            } else {
                btn.classList.remove('bg-meme-green', 'text-black');
                btn.classList.add('text-gray-500');
            }
        });

        if (!State.get('wallet') && tabName !== 'wallet' && tabName !== 'settings') {
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center py-24 text-center">
                    <div class="w-16 h-16 bg-meme-card border-2 border-black shadow-brutal flex items-center justify-center text-gray-700 text-3xl mb-6 rotate-[-10deg]">
                        <i class="fas fa-lock"></i>
                    </div>
                    <p class="font-display text-xl text-gray-600 uppercase italic">Connect terminal to view ${tabName}</p>
                </div>`;
            return;
        }

        switch(tabName) {
            case 'wallet': WalletUI.renderDashboard(); break;
            case 'swap':
                 // We can trigger a re-render of Swap Terminal or similar logic
                 content.innerHTML = '<div class="p-8 text-center text-gray-600 uppercase italic">Swap Logic Integrated in Main View</div>';
                 break;
            case 'settings':
                 content.innerHTML = `
                    <div class="space-y-6">
                        <h3 class="text-xl font-display italic uppercase">Settings</h3>
                        <div class="space-y-4">
                            <div>
                                <label class="text-[10px] font-black uppercase text-gray-500">Default Slippage</label>
                                <input type="number" id="default-slippage" class="w-full bg-black border border-gray-800 p-3 rounded-xl text-white outline-none" value="1.0">
                            </div>
                        </div>
                    </div>`;
                 break;
            default:
                 content.innerHTML = `<div class="p-8 text-center text-gray-600 uppercase italic">Tab ${tabName.toUpperCase()} coming soon</div>`;
        }
    };

    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            State.set('sidebarTab', btn.dataset.tab);
        });
    });

    State.subscribe('sidebarTab', (tabName) => {
        updateActiveTab(tabName);
    });

    window.addEventListener('paxi_toggle_sidebar', () => {
        sidebar?.classList.toggle('translate-x-full');
    });

    updateActiveTab(State.get('sidebarTab') || 'wallet');
};
