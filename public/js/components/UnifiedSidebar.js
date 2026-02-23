// ============================================
// UNIFIEDSIDEBAR COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';
import { formatBalance, shortenAddress } from '../core/utils.js';

export const UnifiedSidebar = {
    render: () => {
        return `
            <div id="unifiedSidebar" class="w-80 border-l border-card bg-surface flex flex-col h-full transition-transform duration-300 translate-x-full lg:translate-x-0 fixed lg:static right-0 z-[110]">
                <!-- Tabs -->
                <div class="flex border-b border-card">
                    ${['wallet', 'history', 'lp'].map(t => `
                        <button class="sidebar-tab flex-1 px-3 py-4 text-[10px] font-display italic uppercase tracking-widest text-muted-text hover:text-primary-text border-b-2 border-transparent transition-all" data-tab="${t}">${t}</button>
                    `).join('')}
                </div>

                <!-- Content Area -->
                <div id="sidebarContent" class="flex-1 overflow-y-auto no-scrollbar p-4">
                    <div id="wallet-view" class="space-y-6">
                        <!-- Wallet content -->
                        <div id="walletNotConnected" class="text-center py-20">
                            <div class="w-16 h-16 bg-card border-2 border-card flex items-center justify-center mx-auto mb-4 rotate-[5deg]">
                                <i class="fas fa-wallet text-muted-text/30 text-2xl"></i>
                            </div>
                            <p class="font-display text-lg uppercase italic text-muted-text">Terminal Offline</p>
                            <button onclick="window.showConnectModal?.()" class="mt-4 px-6 py-2 bg-accent text-black font-display uppercase italic border-2 border-card shadow-brutal-sm">Connect</button>
                        </div>
                        <div id="walletConnected" class="hidden space-y-6">
                            <div class="p-4 bg-card border-4 border-card shadow-brutal-sm">
                                <div class="text-[8px] font-mono text-muted-text uppercase font-bold mb-1">Balance</div>
                                <div id="sideWalletBalance" class="text-3xl font-display text-primary-text italic tracking-tighter">0.00 PAXI</div>
                                <div id="sideWalletAddr" class="text-[8px] font-mono text-meme-cyan uppercase mt-2">...</div>
                            </div>
                            <div id="sideAssetList" class="space-y-2">
                                <h3 class="text-[10px] font-display uppercase italic text-muted-text border-b border-card pb-2">Your Signal Assets</h3>
                                <!-- Assets -->
                            </div>
                        </div>
                    </div>

                    <div id="history-view" class="hidden space-y-4">
                        <h3 class="text-[10px] font-display uppercase italic text-muted-text border-b border-card pb-2">Ledger Logs</h3>
                        <div id="history-container" class="space-y-2">
                            <!-- History -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        const tabs = container.querySelectorAll('.sidebar-tab');
        const contents = {
            wallet: container.querySelector('#wallet-view'),
            history: container.querySelector('#history-view'),
            lp: container.querySelector('#lp-view')
        };

        const setTab = (activeTab) => {
            tabs.forEach(btn => {
                const isActive = btn.dataset.tab === activeTab;
                btn.classList.toggle('text-primary-text', isActive);
                btn.classList.toggle('border-accent', isActive);
                btn.classList.toggle('text-muted-text', !isActive);
                btn.classList.toggle('border-transparent', !isActive);
            });

            Object.keys(contents).forEach(key => {
                if (contents[key]) {
                    contents[key].classList.toggle('hidden', key !== activeTab);
                }
            });
        };

        tabs.forEach(btn => btn.addEventListener('click', () => setTab(btn.dataset.tab)));
        setTab('wallet'); // Default

        State.subscribe('walletData', (data) => {
            const connected = container.querySelector('#walletConnected');
            const disconnected = container.querySelector('#walletNotConnected');

            if (data) {
                connected?.classList.remove('hidden');
                disconnected?.classList.add('hidden');
                container.querySelector('#sideWalletBalance').textContent = `${formatBalance(data.paxi_balance || 0)} PAXI`;
                container.querySelector('#sideWalletAddr').textContent = shortenAddress(data.address);
            } else {
                connected?.classList.add('hidden');
                disconnected?.classList.remove('hidden');
            }
        });
    }
};
