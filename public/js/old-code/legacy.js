// ============================================
// LEGACY.JS - Unused / Deprecated Code
// ============================================

// Original modal-based wallet details
window.renderWalletDetails = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="flex flex-col gap-6">
        <div class="stat-card">
            <div class="text-[10px] text-gray-500 uppercase font-black mb-1">Native Balance</div>
            <div class="text-2xl font-black text-up" id="sidebar-paxi-bal">0.00 PAXI</div>
            <div class="text-[9px] text-gray-600 font-mono mt-1">${window.wallet.address}</div>
        </div>
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">MY ASSETS<button onclick="window.renderWalletDetails()" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
            <div id="sidebar-assets-list" class="space-y-2"><div class="text-center py-8"><div class="spinner mx-auto scale-50"></div></div></div>
        </div>
    </div>`;
    window.updateBalances();
    const tokens = await window.loadWalletTokens(window.wallet.address);
    const assetList = document.getElementById('sidebar-assets-list');
    if (!assetList) return;
    if (tokens.length === 0) { assetList.innerHTML = '<p class="text-center text-gray-600 text-[10px] py-4">No PRC20 assets found</p>'; }
    else {
        assetList.innerHTML = tokens.map(t => {
            const detail = t.detail;
            const balance = parseFloat(t.balance) / Math.pow(10, detail.decimals);
            const value = balance * detail.price_paxi;
            return `<div class="p-3 bg-card rounded-xl border border-border flex items-center justify-between hover:border-up transition-all cursor-pointer" onclick="window.selectPRC20('${t.address}')">
                <div class="flex items-center gap-3">
                    <img src="${detail.logo}" class="w-8 h-8 rounded-full border border-border" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="w-8 h-8 rounded-full bg-up/10 items-center justify-center text-up font-bold text-xs" style="display:none;">${detail.symbol.charAt(0)}</div>
                    <div><div class="text-xs font-bold">${detail.symbol}</div><div class="text-[9px] text-gray-500">${balance.toFixed(2)}</div></div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-bold text-white">${window.formatAmount(value)} PAXI</div>
                    <div class="text-[9px] ${detail.price_change_24h >= 0 ? 'text-up' : 'text-down'}">${detail.price_change_24h >= 0 ? '+' : ''}${(detail.price_change_24h*100).toFixed(2)}%</div>
                </div>
            </div>`;
        }).join('');
    }
};

window.showWalletActions = function() {
    if (!window.wallet) {
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    window.removeClass('walletActionsModal', 'hidden');
    window.setText('receiveAddress', window.wallet.address);
    document.getElementById('receiveQR').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.wallet.address}`;
    window.populateSendTokens();
};

window.hideWalletActions = function() {
    window.addClass('walletActionsModal', 'hidden');
};

window.switchWalletTab = function(tab) {
    if (tab === 'send') {
        window.removeClass('contentSend', 'hidden');
        window.addClass('contentReceive', 'hidden');
        document.getElementById('tabSend').className = 'flex-1 py-2 text-sm font-semibold border-b-2 border-purple-500 text-white';
        document.getElementById('tabReceive').className = 'flex-1 py-2 text-sm font-semibold text-gray-400 hover:text-white';
    } else {
        window.addClass('contentSend', 'hidden');
        window.removeClass('contentReceive', 'hidden');
        document.getElementById('tabSend').className = 'flex-1 py-2 text-sm font-semibold text-gray-400 hover:text-white';
        document.getElementById('tabReceive').className = 'flex-1 py-2 text-sm font-semibold border-b-2 border-purple-500 text-white';
    }
};

window.showLPModal = function() {
    if (!window.wallet) {
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }
    window.removeClass('lpModal', 'hidden');
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    const tokenSymbolEl = document.getElementById('lpTokenSymbol');
    if (tokenSymbolEl) {
        window.setText(tokenSymbolEl, symbol + ' Amount');
    }
    window.updateLPBalances();
};

window.hideLPModal = function() {
    window.addClass('lpModal', 'hidden');
};

window.switchLPTab = function(tab) {
    if (tab === 'add') {
        window.removeClass('contentAddLP', 'hidden');
        window.addClass('contentRemoveLP', 'hidden');
    } else {
        window.addClass('contentAddLP', 'hidden');
        window.removeClass('contentRemoveLP', 'hidden');
    }
};

window.toggleTxHistory = function() {
    const modal = document.getElementById('txHistoryModal');
    if (modal.classList.contains('hidden')) {
        if (!window.wallet) {
            window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
            return;
        }
        modal.classList.remove('hidden');
        window.renderTxHistory();
    } else {
        modal.classList.add('hidden');
    }
};
