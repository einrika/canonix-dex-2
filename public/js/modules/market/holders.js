// ============================================
// HOLDERS.JS - Token Holders Management (Optimized)
// ============================================

// ===== GLOBAL HOLDERS STATE =====
window.holdersList = [];
window.holdersPage = 1;
window.isFetchingHolders = false;
window.holdersCache = {};

// ===== SHOW HOLDERS MODAL =====
window.showHolders = function() {
    if (!window.currentPRC20) return;
    const tabBtn = document.getElementById('tab-holders');
    if (tabBtn) {
        if (typeof window.setTab === 'function') window.setTab('holders');
        else { window.holdersPage = 1; window.loadTokenHolders(); }
    } else {
        window.removeClass('holdersModal', 'hidden'); window.holdersPage = 1; window.loadTokenHolders();
    }
};

window.hideHolders = function() { window.addClass('holdersModal', 'hidden'); };

// ===== LOAD HOLDERS DATA =====
window.loadTokenHolders = async function(isRefresh = true) {
    const container = document.getElementById('tabContent');
    if (!container) return;
    if (isRefresh) { window.holdersPage = 1; window.holdersCache = {}; }
    if (window.holdersPage === 1) {
        container.innerHTML = `<div class="text-center py-20">
            <div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="font-mono text-[10px] text-secondary-text uppercase font-black tracking-widest italic">Scanning Ape Population...</p>
        </div>`;
    }
    try { await window.fetchTokenHolders(window.holdersPage); }
    catch (e) {
        console.error("Holders fetch error:", e);
        container.innerHTML = `<div class="text-center py-20">
            <p class="font-display text-2xl text-meme-pink uppercase italic mb-6">UPLINK FAILED</p>
            <button onclick="window.loadTokenHolders()" class="px-8 py-3 bg-surface border-4 border-card text-primary-text font-display text-xl uppercase italic shadow-brutal hover:shadow-none transition-all">REBOOT SCAN</button>
        </div>`;
    }
};

// ===== FETCH TOKEN HOLDERS =====
window.fetchTokenHolders = async function(page) {
    if (window.isFetchingHolders) return;
    window.isFetchingHolders = true;
    const cacheKey = `${window.currentPRC20}_p${page}`;
    if (window.holdersCache[cacheKey] && (Date.now() - window.holdersCache[cacheKey].time < 60000)) {
        window.holdersList = window.holdersCache[cacheKey].data;
        window.renderHoldersTable(window.holdersList, page);
        window.isFetchingHolders = false; return;
    }
    try {
        const url = `/api/prc20/holders?contract_address=${window.currentPRC20}&page=${page - 1}`;
        const data = await window.fetchDirect(url);
        let list = [];
        if (data && data.accounts) {
            list = data.accounts;
            const detail = window.tokenDetails.get(window.currentPRC20);
            if (detail && detail.total_supply) {
                const supply = parseFloat(detail.total_supply);
                list.forEach(item => { if (!item.percentage && supply > 0) item.percentage = (parseFloat(item.balance) / supply) * 100; });
            }
        }
        window.holdersList = list;
        window.holdersCache[cacheKey] = { data: list, time: Date.now() };
        window.renderHoldersTable(window.holdersList, page);
    } catch (e) { console.error("Holders API error:", e); } finally { window.isFetchingHolders = false; }
};

// ===== RENDER HOLDERS TABLE =====
window.renderHoldersTable = function(list, page) {
    const container = document.getElementById('tabContent');
    if (!container) return;
    const limit = window.APP_CONFIG.ITEMS_PER_PAGE || 30;
    const isEnd = list.length < limit;
    if (!list || list.length === 0) {
        container.innerHTML = '<div class="text-center py-20 font-display text-2xl text-muted-text uppercase italic">Empty Habitat</div>'; return;
    }
    const startRank = (page - 1) * limit;
    const headers = 
        `<tr class="font-display text-base text-secondary-text uppercase italic border-b-2 border-card">
            <th class="p-4">RANK</th>
            <th class="p-4">ADDRESS</th>
            <th class="p-4 text-right">BAG</th>
            <th class="p-4 text-right">SHARE</th>
        </tr>`;
    let html = `<div class="overflow-x-auto no-scrollbar"><table class="w-full text-left border-collapse">
        <thead class="bg-surface sticky top-0 z-10">${headers}</thead>
        <tbody class="divide-y divide-black/50">`;
    for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx]; const rank = startRank + idx + 1;
        const addr = item.address || item.account_address || item;
        const bal = item.balance !== undefined ? item.balance : '-';
        const pct = item.percentage !== undefined ? item.percentage : 0;
        const shortAddr = typeof addr === 'string' ? window.shortenAddress(addr, 7) : 'Unknown';
        const fullAddr = typeof addr === 'string' ? addr : '';
        let balanceDisplay = bal; if (typeof bal === 'number') balanceDisplay = window.formatBalance(bal, 6);
        else if (typeof bal === 'string' && bal !== '-' && bal !== 'Loading...') {
            const numBal = parseFloat(bal); if (!isNaN(numBal)) balanceDisplay = window.formatBalance(numBal, 6);
        }
        const isMe = window.wallet && window.wallet.address === fullAddr;
        const isPool = fullAddr === 'paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t';
        const rowClass = isMe ? "bg-meme-green/5" : (isPool ? "bg-meme-cyan/5" : "hover:bg-card");
        html += `<tr class="${rowClass} transition-colors group">
            <td class="p-4 font-display text-xl italic text-muted-text">#${rank}</td>
            <td class="p-4 font-mono text-[10px] text-secondary-text">
                <div class="flex items-center gap-2">
                    <span class="truncate max-w-[200px] uppercase font-bold text-primary-text">${shortAddr}</span>
                    ${isMe ? '<span class="px-1.5 py-0.5 bg-meme-green text-black border border-card text-[7px] font-black italic">YOU</span>' : ''}
                    ${isPool ? '<span class="px-1.5 py-0.5 bg-meme-cyan text-black border border-card text-[7px] font-black italic">[POOL]</span>' : ''}
                    <a href="https://explorer.paxinet.io/accounts/${fullAddr}" target="_blank" class="text-meme-yellow hover:scale-110 transition-transform"><i class="fas fa-external-link-alt text-[10px]"></i></a>
                </div>
            </td>
            <td class="p-4 text-right font-mono text-[10px] font-black text-primary-text">${balanceDisplay}</td>
            <td class="p-4 text-right min-w-[100px]">
                <div class="flex flex-col items-end gap-1">
                    <span class="font-display text-sm text-meme-cyan italic">${pct.toFixed(2)}%</span>
                    <div class="w-32 h-2.5 bg-surface border border-card overflow-hidden shadow-inner">
                        <div class="h-full bg-meme-cyan border-r-2 border-card w-[${Math.round(pct)}%]"></div>
                    </div>
                </div>
            </td>
        </tr>`;
    }
    html += '</tbody></table></div>';
    if (!isEnd) {
        html += `<div id="holdersLoadMoreWrapper" class="p-10 flex justify-center bg-surface border-t-4 border-card">
            <button onclick="window.loadMoreHolders()" id="btnLoadMoreHolders" class="px-12 py-4 bg-meme-cyan text-black font-display text-3xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">LOAD MORE APES</button>
        </div>`;
    } else {
        html += `<div class="py-10 text-center font-mono text-[8px] text-muted-text uppercase font-black tracking-[0.4em] bg-surface border-t-4 border-card">END OF POPULATION LIST</div>`;
    }
    if (page === 1) container.innerHTML = html;
    else {
        const oldWrapper = document.getElementById('holdersLoadMoreWrapper'); if (oldWrapper) oldWrapper.remove();
        const tbody = container.querySelector('tbody'); const temp = document.createElement('div'); temp.innerHTML = html;
        temp.querySelectorAll('tbody tr').forEach(row => tbody.appendChild(row));
        const newWrapper = temp.querySelector('#holdersLoadMoreWrapper');
        if (newWrapper) container.appendChild(newWrapper);
        else {
            const endMarker = document.createElement('div'); endMarker.className = 'py-10 text-center font-mono text-[8px] text-muted-text uppercase font-black tracking-[0.4em] bg-surface border-t-4 border-card';
            endMarker.textContent = 'END OF POPULATION LIST'; container.appendChild(endMarker);
        }
    }
};

window.loadMoreHolders = async function() {
    if (window.isFetchingHolders) return;
    const btn = document.getElementById('btnLoadMoreHolders');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> SYNCING...'; }
    window.holdersPage++; await window.fetchTokenHolders(window.holdersPage);
};
