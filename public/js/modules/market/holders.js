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
            <p class="font-mono text-[10px] text-gray-500 uppercase font-black tracking-widest italic">Scanning Ape Population...</p>
        </div>`;
    }
    try { await window.fetchTokenHolders(window.holdersPage); }
    catch (e) {
        console.error("Holders fetch error:", e);
        container.innerHTML = `<div class="text-center py-20">
            <p class="font-display text-2xl text-meme-pink uppercase italic mb-6">UPLINK FAILED</p>
            <button onclick="window.loadTokenHolders()" class="px-8 py-3 bg-meme-surface border-4 border-black text-white font-display text-xl uppercase italic shadow-brutal hover:shadow-none transition-all">REBOOT SCAN</button>
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
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/holders?contract_address=${window.currentPRC20}&page=${page - 1}`;
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
        container.innerHTML = '<div class="text-center py-20 font-display text-2xl text-gray-700 uppercase italic">Empty Habitat</div>'; return;
    }
    const startRank = (page - 1) * limit;
    const headers = 
        `<tr class="font-display text-lg text-gray-500 uppercase italic border-b-4 border-black">
            <th class="p-6">RANK</th>
            <th class="p-6">APE ADDRESS</th>
            <th class="p-6 text-right">BAG SIZE</th>
            <th class="p-6 text-right">SHARE</th>
        </tr>`;
    let html = `<div class="overflow-x-auto no-scrollbar"><table class="w-full text-left border-collapse">
        <thead class="bg-black sticky top-0 z-10">${headers}</thead>
        <tbody class="divide-y-2 divide-black">`;
    for (let idx = 0; idx < list.length; idx++) {
        const item = list[idx]; const rank = startRank + idx + 1;
        const addr = item.address || item.account_address || item;
        const bal = item.balance !== undefined ? item.balance : '-';
        const pct = item.percentage !== undefined ? item.percentage : 0;
        const shortAddr = typeof addr === 'string' ? window.shortenAddress(addr, 12) : 'Unknown';
        const fullAddr = typeof addr === 'string' ? addr : '';
        let balanceDisplay = bal; if (typeof bal === 'number') balanceDisplay = window.formatBalance(bal, 6);
        else if (typeof bal === 'string' && bal !== '-' && bal !== 'Loading...') {
            const numBal = parseFloat(bal); if (!isNaN(numBal)) balanceDisplay = window.formatBalance(numBal, 6);
        }
        const isMe = window.wallet && window.wallet.address === fullAddr;
        const isPool = fullAddr === 'paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t';
        const rowClass = isMe ? "bg-meme-green/10" : (isPool ? "bg-meme-cyan/10" : "hover:bg-meme-card");
        html += `<tr class="${rowClass} transition-colors group">
            <td class="p-6 font-display text-3xl italic text-gray-700">#${rank}</td>
            <td class="p-6 font-mono text-sm text-gray-400">
                <div class="flex items-center gap-4">
                    <span class="truncate max-w-[150px] uppercase font-bold text-white">${shortAddr}</span>
                    ${isMe ? '<span class="px-2 py-0.5 bg-meme-green text-black border-2 border-black text-[8px] font-black italic">YOU</span>' : ''}
                    ${isPool ? '<span class="px-2 py-0.5 bg-meme-cyan text-black border-2 border-black text-[8px] font-black italic">[POOL]</span>' : ''}
                    <a href="https://winscan.winsnip.xyz/paxi-mainnet/accounts/${fullAddr}" target="_blank" class="text-meme-yellow hover:scale-125 transition-transform"><i class="fas fa-external-link-alt text-xs"></i></a>
                </div>
            </td>
            <td class="p-6 text-right font-mono text-sm font-black text-white">${balanceDisplay}</td>
            <td class="p-6 text-right min-w-[150px]">
                <div class="flex flex-col items-end gap-2">
                    <span class="font-display text-xl text-meme-cyan italic">${pct.toFixed(2)}%</span>
                    <div class="w-full h-3 bg-black border-2 border-meme-surface overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <div class="h-full bg-meme-cyan" style="width: ${Math.min(100, pct)}%"></div>
                    </div>
                </div>
            </td>
        </tr>`;
    }
    html += '</tbody></table></div>';
    if (!isEnd) {
        html += `<div id="holdersLoadMoreWrapper" class="p-10 flex justify-center bg-meme-surface border-t-4 border-black">
            <button onclick="window.loadMoreHolders()" id="btnLoadMoreHolders" class="px-12 py-4 bg-meme-cyan text-black font-display text-3xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">LOAD MORE APES</button>
        </div>`;
    } else {
        html += `<div class="py-10 text-center font-mono text-[8px] text-gray-700 uppercase font-black tracking-[0.4em] bg-meme-surface border-t-4 border-black">END OF POPULATION LIST</div>`;
    }
    if (page === 1) container.innerHTML = html;
    else {
        const oldWrapper = document.getElementById('holdersLoadMoreWrapper'); if (oldWrapper) oldWrapper.remove();
        const tbody = container.querySelector('tbody'); const temp = document.createElement('div'); temp.innerHTML = html;
        temp.querySelectorAll('tbody tr').forEach(row => tbody.appendChild(row));
        const newWrapper = temp.querySelector('#holdersLoadMoreWrapper');
        if (newWrapper) container.appendChild(newWrapper);
        else {
            const endMarker = document.createElement('div'); endMarker.className = 'py-10 text-center font-mono text-[8px] text-gray-700 uppercase font-black tracking-[0.4em] bg-meme-surface border-t-4 border-black';
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
