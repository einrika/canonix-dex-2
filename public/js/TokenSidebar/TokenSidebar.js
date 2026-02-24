// ============================================
// TOKEN SIDEBAR LOGIC
// ============================================

import { State } from '../core/state.js';
import { TokensModule } from '../modules/market/tokens.js';
import { formatAmount } from '../core/utils.js';

export const TokenSidebarLogic = (container) => {
    const listContainer = container.querySelector('#tokenSidebarList');
    const searchInput = container.querySelector('#tokenSidebarSearch');

    const renderList = (tokens) => {
        if (!listContainer) return;
        if (!tokens || tokens.length === 0) {
            listContainer.innerHTML = '<div class="text-center py-8 text-gray-600">No Tokens Found</div>';
            return;
        }

        listContainer.innerHTML = tokens.map(t => `
            <div class="p-3 border-b border-black hover:bg-meme-surface cursor-pointer group transition-all" data-address="${t.address}">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-meme-card border-2 border-black flex items-center justify-center font-black text-xs shadow-brutal-sm group-hover:rotate-6 transition-transform">
                        ${t.symbol.charAt(0)}
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="flex justify-between items-center mb-0.5">
                            <span class="font-display text-sm text-white uppercase truncate">${t.symbol}</span>
                            <span class="text-[10px] font-mono ${t.price_change_24h >= 0 ? 'text-meme-green' : 'text-meme-pink'}">
                                ${t.price_change_24h >= 0 ? '+' : ''}${(t.price_change_24h * 100).toFixed(2)}%
                            </span>
                        </div>
                        <div class="flex justify-between text-[8px] font-mono font-bold text-gray-600 uppercase">
                            <span class="truncate">${t.name}</span>
                            <span>$${formatAmount(t.liquidity)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        listContainer.querySelectorAll('[data-address]').forEach(el => {
            el.addEventListener('click', () => {
                TokensModule.selectToken(el.dataset.address);
            });
        });
    };

    searchInput?.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const tokens = State.get('marketTokens') || [];
        const filtered = tokens.filter(t =>
            t.symbol.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query) ||
            t.address.toLowerCase().includes(query)
        );
        renderList(filtered);
    });

    State.subscribe('marketTokens', (tokens) => {
        renderList(tokens);
    });

    // Initial load
    TokensModule.loadTokens();
};
