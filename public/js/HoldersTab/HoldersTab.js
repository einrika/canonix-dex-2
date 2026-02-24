// ============================================
// HOLDERS TAB LOGIC
// ============================================

import { State } from '../core/state.js';
import { HoldersModule } from '../modules/market/holders.js';
import { shortenAddress, formatAmount } from '../core/utils.js';

export const HoldersTabLogic = (container) => {
    const listContainer = container.querySelector('#holders-list');
    const loadMoreBtn = container.querySelector('#load-more-holders');

    const renderList = (holders) => {
        if (!listContainer) return;
        if (!holders || holders.length === 0) {
            listContainer.innerHTML = '<div class="text-center py-8 text-gray-600">No Holders Found</div>';
            return;
        }

        listContainer.innerHTML = holders.map((h, i) => `
            <div class="flex items-center justify-between p-3 border-b border-black hover:bg-meme-surface">
                <div class="flex items-center gap-3">
                    <span class="text-[10px] text-gray-600 font-mono">${i + 1}.</span>
                    <span class="text-sm font-mono text-white">${shortenAddress(h.address)}</span>
                </div>
                <div class="text-right">
                    <div class="text-sm font-black text-meme-cyan">${formatAmount(h.balance)}</div>
                    <div class="text-[8px] text-gray-500">${h.percentage}%</div>
                </div>
            </div>
        `).join('');
    };

    loadMoreBtn?.addEventListener('click', () => {
        HoldersModule.loadMore();
    });

    State.subscribe('holdersList', (holders) => {
        renderList(holders);
    });

    State.subscribe('currentToken', () => {
        HoldersModule.loadHolders();
    });

    // Initial load
    HoldersModule.loadHolders();
};
