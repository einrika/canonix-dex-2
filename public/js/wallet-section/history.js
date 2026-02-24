// ============================================
// HISTORY.JS - Transaction History
// ============================================

import { State } from '../core/state.js';
import { APP_CONFIG } from '../core/config.js';
import { fetchDirect, shortenAddress } from '../core/utils.js';

export const WalletHistory = {
    loadHistory: async function() {
        const wallet = State.get('wallet');
        if (!wallet) return;

        const container = document.getElementById('history-container');
        if (!container) return;

        container.innerHTML = '<div class="text-center py-8"><div class="w-8 h-8 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mx-auto"></div></div>';

        try {
            const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/tx-history?address=${wallet.address}`);
            if (!data || !data.txs || data.txs.length === 0) {
                container.innerHTML = '<div class="text-center py-8 text-gray-600 uppercase font-black text-[10px]">No Transactions Found</div>';
                return;
            }

            container.innerHTML = data.txs.map(tx => this.renderTxItem(tx)).join('');
        } catch (e) {
            console.error("Failed to load history", e);
            container.innerHTML = '<div class="text-center py-8 text-down uppercase font-black text-[10px]">Failed to Load History</div>';
        }
    },

    renderTxItem: function(tx) {
        const isSuccess = tx.code === 0;
        return `
            <div class="p-3 bg-meme-surface border-2 border-black shadow-brutal-sm mb-2">
                <div class="flex justify-between items-center">
                    <span class="text-[10px] font-black uppercase text-white">${tx.type || 'Transaction'}</span>
                    <span class="text-[8px] font-mono text-gray-500">${shortenAddress(tx.hash, 8)}</span>
                </div>
                <div class="flex justify-between items-end mt-1">
                    <span class="text-[8px] text-gray-600">${new Date(tx.timestamp).toLocaleString()}</span>
                    <span class="text-[10px] font-black ${isSuccess ? 'text-meme-green' : 'text-meme-pink'} uppercase italic">${isSuccess ? 'Success' : 'Failed'}</span>
                </div>
            </div>
        `;
    }
};
