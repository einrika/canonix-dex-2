// ============================================
// TOKENSIDEBAR COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';
import { shortenAddress, normalizeLogoUrl } from '../core/utils.js';

export const TokenSidebar = {
    render: () => {
        return `
            <div id="tokenSidebar" class="w-72 border-r border-card bg-surface flex flex-col h-full transition-transform duration-300 -translate-x-full lg:translate-x-0 fixed lg:static z-[110]">
                <!-- Sidebar Header -->
                <div class="p-3 border-b border-card flex flex-col gap-3">
                    <div class="flex items-center justify-between">
                        <span class="font-display text-lg italic uppercase text-primary-text">Terminal List</span>
                        <span id="totalstoken" class="text-[8px] font-mono text-muted-text font-bold">0 OF 0</span>
                    </div>
                    <div class="relative">
                        <input id="tokenSidebarSearch" type="text" placeholder="Search Symbol/Address..."
                               class="w-full bg-card border border-card px-3 py-2 text-[10px] font-mono text-primary-text outline-none focus:border-meme-cyan/50 transition-all uppercase placeholder:italic">
                        <i class="fas fa-search absolute right-3 top-1/2 -translate-y-1/2 text-muted-text/30 text-[10px]"></i>
                    </div>
                </div>

                <!-- Sort Tabs -->
                <div class="flex border-b border-card overflow-x-auto no-scrollbar">
                    ${['hot', 'new', 'verified'].map(s => `
                        <button class="sort-btn flex-1 px-3 py-2 text-[8px] font-mono font-bold uppercase tracking-widest text-muted-text hover:text-primary-text border-b-2 border-transparent transition-all italic" data-sort="${s}">${s}</button>
                    `).join('')}
                </div>

                <!-- Token List -->
                <div id="tokenSidebarList" class="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                    <div class="text-center py-20 text-muted-text font-mono text-[10px] uppercase tracking-widest animate-pulse">Syncing Chain...</div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        container.querySelector('#tokenSidebarSearch').addEventListener('input', (e) => {
            // Filter logic
            console.log('Searching:', e.target.value);
        });

        container.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const sort = btn.dataset.sort;
                State.set('tokenSort', sort);
                container.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('border-meme-cyan', 'text-primary-text'));
                btn.classList.add('border-meme-cyan', 'text-primary-text');
            });
        });

        const renderList = (tokens) => {
            const list = container.querySelector('#tokenSidebarList');
            if (!tokens || tokens.length === 0) {
                list.innerHTML = '<div class="text-center py-20 text-muted-text font-mono text-[10px] uppercase italic">No signals found</div>';
                return;
            }

            list.innerHTML = tokens.map(t => `
                <div class="token-item p-2 hover:bg-card border border-transparent hover:border-card cursor-pointer group transition-all" data-address="${t.address}">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-surface border border-card flex items-center justify-center text-xs font-display text-primary-text group-hover:rotate-6 transition-transform">
                            <img src="${normalizeLogoUrl(t.logo)}" class="w-full h-full object-cover" onerror="this.style.display='none'">
                            <span class="fallback">${t.symbol.charAt(0)}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <span class="font-display text-xs italic text-primary-text truncate uppercase">${t.symbol}</span>
                                <span class="text-[8px] font-mono ${t.price_change_24h >= 0 ? 'text-up' : 'text-down'}">${(t.price_change_24h * 100).toFixed(2)}%</span>
                            </div>
                            <div class="text-[7px] font-mono text-muted-text truncate uppercase">${shortenAddress(t.address)}</div>
                        </div>
                    </div>
                </div>
            `).join('');

            list.querySelectorAll('.token-item').forEach(item => {
                item.addEventListener('click', () => {
                    const addr = item.dataset.address;
                    State.set('currentTokenAddress', addr);
                });
            });
        };

        State.subscribe('tokenList', renderList);
    }
};
