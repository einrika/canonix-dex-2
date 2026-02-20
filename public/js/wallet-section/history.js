// ============================================
// HISTORY.JS - Wallet Transaction History Module
// ============================================

window.WalletHistory = {
    init: function() {
        console.log('✅ WalletHistory initialized');
    },

    loadHistory: function() {
        const container = document.getElementById('history-container');
        if (!container) return;

        const activeWallet = window.WalletManager.getActiveWallet();
        if (!activeWallet) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-wallet text-4xl text-gray-700 mb-3"></i>
                    <p class="text-sm text-gray-500 font-bold">No wallet connected</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div class="text-[10px] text-gray-500 mt-3 uppercase font-black tracking-widest">Loading History...</div>
            </div>
        `;

        // Fetch transactions using existing function
        if (window.fetchUserTransactions) {
            window.fetchUserTransactions(activeWallet.address).then(txs => {
                this.renderHistoryList(container, txs, activeWallet.address);
            }).catch(err => {
                console.error('Failed to load history:', err);
                container.innerHTML = '<div class="text-center py-8 text-gray-500 text-sm">Failed to load history</div>';
            });
        } else {
            // Fallback if function not available
            this.renderEmptyState(container);
        }
    },

    renderHistoryList: function(container, txs, activeAddress) {
        if (!txs || txs.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        // Render transaction list
        container.innerHTML = `
            <div class="space-y-2">
                ${txs.slice(0, 20).map(tx => {
                    const isSent = tx.from === activeAddress;
                    const type = isSent ? 'Sent' : 'Received';
                    const icon = isSent ? 'fa-arrow-up' : 'fa-arrow-down';
                    const color = isSent ? 'text-down' : 'text-up';

                    return `
                        <div class="p-3 bg-surface border border-border rounded-xl hover:bg-card transition-all">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-${isSent ? 'down' : 'up'}/10 flex items-center justify-center ${color}">
                                    <i class="fas ${icon} text-sm"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start mb-1">
                                        <span class="text-xs font-bold ${color}">${type}</span>
                                        <span class="text-xs font-mono">${tx.amount || '0'} ${tx.symbol || 'PAXI'}</span>
                                    </div>
                                    <div class="flex justify-between items-center">
                                        <div class="text-[10px] text-gray-500">${window.shortenAddress(isSent ? tx.to : tx.from)}</div>
                                        <div class="text-[8px] text-gray-600 font-mono">${this.formatTimestamp(tx.timestamp)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    renderEmptyState: function(container) {
        container.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-history text-4xl text-gray-700 mb-3"></i>
                <p class="text-sm text-gray-500 font-bold">No transaction history</p>
                <p class="text-xs text-gray-600 mt-1">Your transactions will appear here</p>
            </div>
        `;
    },

    formatTimestamp: function(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
};

// Hook into WalletUI if it exists
if (window.WalletUI) {
    window.WalletUI.loadHistory = function() {
        window.WalletHistory.loadHistory();
    };
}
