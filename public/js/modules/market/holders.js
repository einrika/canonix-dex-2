// ============================================
// HOLDERS.JS - Token Holders Management (Optimized)
// ============================================

// ===== GLOBAL HOLDERS STATE =====
window.holdersList = [];
window.holdersPage = 1;
window.isFetchingHolders = false;
window.holdersCache = {}; // Changed to object for pagination caching

// ===== SHOW HOLDERS MODAL =====
window.showHolders = function() {
    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }

    // Check if we have the tab system
    const tabBtn = document.getElementById('tab-holders');
    if (tabBtn) {
        if (typeof window.setTab === 'function') {
            window.setTab('holders');
        } else {
            // Fallback: manually trigger
            window.holdersPage = 1;
            window.loadTokenHolders();
        }
    } else {
        // Old modal system fallback
        window.removeClass('holdersModal', 'hidden');
        window.holdersPage = 1;
        window.loadTokenHolders();
    }
};

window.hideHolders = function() {
    window.addClass('holdersModal', 'hidden');
};

// ===== LOAD HOLDERS DATA =====
window.loadTokenHolders = async function(isRefresh = true) {
    const container = document.getElementById('tabContent');
    if (!container) return;

    if (isRefresh) {
        window.holdersPage = 1;
        window.holdersCache = {}; // Clear cache on manual refresh
    }

    const page = window.holdersPage;
    
    if (page === 1) {
        container.innerHTML = `<div class="text-center py-12">
            <div class="spinner mx-auto mb-4 scale-75"></div>
            <p class="text-xs text-gray-500 uppercase tracking-widest">Loading Holders...</p>
        </div>`;
    }
    
    try {
        await window.fetchTokenHolders(page);
    } catch (e) {
        console.error("Holders fetch error:", e);
        container.innerHTML = `<div class="text-center py-12">
            <p class="text-red-400 text-xs font-bold mb-2">FAILED TO LOAD HOLDERS</p>
            <button onclick="window.loadTokenHolders()" class="px-4 py-2 bg-card border border-border rounded text-xs">RETRY</button>
        </div>`;
    }
};

// ===== FETCH TOKEN HOLDERS =====
window.fetchTokenHolders = async function(page) {
    if (window.isFetchingHolders) return;
    window.isFetchingHolders = true;

    const cacheKey = `${window.currentPRC20}_p${page}`;

    // Check cache (1 minute validity)
    if (window.holdersCache[cacheKey] && 
        (Date.now() - window.holdersCache[cacheKey].time < 60000)) {
        window.holdersList = window.holdersCache[cacheKey].data;
        window.renderHoldersTable(window.holdersList, page);
        window.isFetchingHolders = false;
        return;
    }

    try {
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/holders?contract_address=${window.currentPRC20}&page=${page - 1}`;
        const data = await window.fetchDirect(url);

        let list = [];
        if (data && data.accounts) {
            list = data.accounts;

            // Calculate percentage if possible
            const detail = window.tokenDetails.get(window.currentPRC20);
            if (detail && detail.total_supply) {
                const supply = parseFloat(detail.total_supply);
                list.forEach(item => {
                    if (!item.percentage && supply > 0) {
                        item.percentage = (parseFloat(item.balance) / supply) * 100;
                    }
                });
            }
        }

        window.holdersList = list;

        // Update cache
        window.holdersCache[cacheKey] = {
            data: list,
            time: Date.now()
        };

        window.renderHoldersTable(window.holdersList, page);
    } catch (e) {
        console.error("Holders API error:", e);
    } finally {
        window.isFetchingHolders = false;
    }
};

// ===== RENDER HOLDERS TABLE =====
window.renderHoldersTable = function(list, page) {
    const container = document.getElementById('tabContent');
    if (!container) return;

    const limit = window.APP_CONFIG.ITEMS_PER_PAGE || 30;
    const isEnd = list.length < limit;

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="text-center py-8 text-gray-500">No holders found on this page</div>';
        return;
    }
    
    const startRank = (page - 1) * limit;
    
    const headers = 
        `<tr>
            <th class="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Rank</th>
            <th class="px-4 py-3 text-left text-[10px] font-black text-gray-500 uppercase tracking-wider">Account</th>
            <th class="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Balance</th>
            <th class="px-4 py-3 text-right text-[10px] font-black text-gray-500 uppercase tracking-wider">Share</th>
        </tr>`;
    
    let html = `<div class="overflow-x-auto"><table class="w-full text-[11px] text-left">
        <thead class="bg-surface/50 sticky top-0 backdrop-blur-sm z-10 border-b border-border">${headers}</thead>
        <tbody class="divide-y divide-border/30">`;
    
    for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx];
        const rank = startRank + idx + 1;
        const addr = item.address || item.account_address || item;
        const bal = item.balance !== undefined ? item.balance : '-';
        const pct = item.percentage !== undefined ? item.percentage : '-';
        const shortAddr = typeof addr === 'string' ? window.shortenAddress(addr) : 'Unknown';
        const fullAddr = typeof addr === 'string' ? addr : '';
        
        let balanceDisplay = bal, balanceTitle = bal;
        if (typeof bal === 'number') {
            balanceDisplay = window.formatBalance(bal, 6);
            balanceTitle = window.formatBalanceFull(bal, 6);
        } else if (typeof bal === 'string' && bal !== '-' && bal !== 'Loading...') {
            const numBal = parseFloat(bal);
            if (!isNaN(numBal)) {
                balanceDisplay = window.formatBalance(numBal, 6);
                balanceTitle = window.formatBalanceFull(numBal, 6);
            }
        }
        
        // Highlight current wallet or pool
        const isMe = window.wallet && window.wallet.address === fullAddr;
        const isPool = fullAddr === 'paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t';
        const rowClass = isMe ? "bg-purple-900/20 hover:bg-purple-900/30" : (isPool ? "bg-blue-900/10" : "hover:bg-gray-800/50");

        const pctNum = typeof pct === 'number' ? pct : 0;
        
        html += `<tr class="${rowClass} transition-colors">
            <td class="px-4 py-3 text-gray-500 w-12 text-center">${rank}</td>
            <td class="px-4 py-3 font-mono text-gray-300">
                <div class="flex items-center gap-2">
                    <span class="truncate max-w-[100px]">${shortAddr}</span>
                    ${isMe ? '<span class="px-1 py-0.5 bg-up/20 text-up text-[8px] rounded font-black">YOU</span>' : ''}
                    ${isPool ? '<span class="px-1 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] rounded font-black">[POOL]</span>' : ''}
                    <a href="https://winscan.winsnip.xyz/paxi-mainnet/accounts/${fullAddr}" target="_blank" class="text-xs text-gray-600 hover:text-white transition-colors">
                        <i class="fas fa-external-link-alt scale-75"></i>
                    </a>
                </div>
            </td>
            <td class="px-4 py-3 text-right font-mono text-gray-300" title="${balanceTitle}">${balanceDisplay}</td>
            <td class="px-4 py-3 text-right w-32">
                <div class="flex flex-col items-end gap-1">
                    <span class="text-[9px] font-bold text-gray-400">${pctNum.toFixed(2)}%</span>
                    <div class="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div class="h-full bg-gradient-to-r from-up to-purple-500" style="width: ${Math.min(100, pctNum)}%"></div>
                    </div>
                </div>
            </td>
        </tr>`;
    }
    
    html += '</tbody></table></div>';

    // Replace Infinite Scroll with "Load More" Button
    if (!isEnd) {
        html += `<div id="holdersLoadMoreWrapper" class="py-6 flex justify-center">
            <button onclick="window.loadMoreHolders()"
                    id="btnLoadMoreHolders"
                    class="px-6 py-2 bg-up/10 border border-up/20 rounded-full text-[10px] font-black text-up uppercase tracking-widest hover:bg-up hover:text-bg transition-all active:scale-95">
                LOAD MORE HOLDERS
            </button>
        </div>`;
    } else {
        html += `<div class="py-6 text-center text-[10px] text-gray-600 uppercase font-black tracking-tighter">End of Holder List</div>`;
    }

    if (page === 1) {
        container.innerHTML = html;
    } else {
        // Remove old button wrapper and append new rows
        const oldWrapper = document.getElementById('holdersLoadMoreWrapper');
        if (oldWrapper) oldWrapper.remove();

        const tbody = container.querySelector('tbody');
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const newRows = temp.querySelectorAll('tbody tr');
        newRows.forEach(row => tbody.appendChild(row));

        const newWrapper = temp.querySelector('#holdersLoadMoreWrapper');
        if (newWrapper) container.appendChild(newWrapper);
        else {
            const endMarker = document.createElement('div');
            endMarker.className = 'py-6 text-center text-[10px] text-gray-600 uppercase font-black tracking-tighter';
            endMarker.textContent = 'End of Holder List';
            container.appendChild(endMarker);
        }
    }
};

window.loadMoreHolders = async function() {
    if (window.isFetchingHolders) return;

    const btn = document.getElementById('btnLoadMoreHolders');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<div class="loading-dots scale-50 text-up"><span>.</span><span>.</span><span>.</span></div>';
    }

    window.holdersPage++;
    await window.fetchTokenHolders(window.holdersPage);
};

// ===== CHANGE HOLDER PAGE =====
window.changeHolderPage = function(dir) {
    const newPage = window.holdersPage + dir;
    if (newPage < 1) return;
    
    window.holdersPage = newPage;
    window.loadTokenHolders();
};