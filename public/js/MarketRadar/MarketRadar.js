// ============================================
// MARKETRADAR LOGIC
// ============================================

window.marketTokens = [];
window.marketFilter = 'hot';
window.marketSubFilter = 'all';
window.marketSearchQuery = '';
window.marketPage = 0;
window.marketLimit = 12;
window.marketTotalAvailable = 0;
window.marketIsFetching = false;
window.searchTimeout = null;

window.UIManager.registerLogic('MarketRadar', (container) => {
    container.querySelectorAll('#market-filter-btns button').forEach(btn => {
        btn.addEventListener('click', (e) => window.setMarketFilter(btn.dataset.filter, e.currentTarget));
    });
    container.querySelector('#marketSearch')?.addEventListener('input', () => window.filterMarket());
    container.querySelector('#loadMoreMarket')?.addEventListener('click', () => window.loadMoreMarket());

    // Initial load
    if (document.getElementById('marketGrid')) {
        window.loadMarketData();
    }
});

async function loadMarketData(type = 'all') {
    try {
        const grid = document.getElementById('marketGrid');
        if (!grid) return;
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-muted-text font-bold uppercase tracking-widest"><div class="w-10 h-10 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>SYNCING...</div>';
        window.marketPage = 0; window.marketTokens = [];
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${window.marketPage}&type=${type}`;
        const data = await window.fetchDirect(url);
        if (data && data.contracts) {
            window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            window.marketTotalAvailable = data.total || data.totals || 0;
            renderMarketGrid();
        }
    } catch (e) { console.error('Failed to load market data', e); }
}

window.setMarketFilter = function(type, btn) {
    window.marketFilter = type; window.marketSubFilter = 'all';
    document.querySelectorAll('.market-filter-btn').forEach(b => { b.classList.remove('bg-meme-green', 'text-black'); b.classList.add('bg-surface', 'text-primary-text'); });
    if (btn) { btn.classList.add('bg-meme-green', 'text-black'); btn.classList.remove('bg-surface', 'text-primary-text'); }
    const subTabsContainer = document.getElementById('marketSubTabs');
    if (type === 'nonpump') { subTabsContainer.classList.remove('hidden'); renderMarketSubTabs(); loadMarketData('nonpump'); }
    else { subTabsContainer.classList.add('hidden'); loadMarketData('all'); }
};

window.setMarketSubFilter = function(subType, btn) {
    window.marketSubFilter = subType; renderMarketSubTabs(); renderMarketGrid();
};

function renderMarketSubTabs() {
    const container = document.getElementById('marketSubTabs');
    if (!container) return;
    const subTabs = [ { id: 'all', label: 'ALL NON-PUMP' }, { id: 'new', label: 'NEW' }, { id: 'gainer', label: 'GAINER' }, { id: 'hot', label: 'HOT' }, { id: 'marketcap', label: 'MCAP' }, { id: 'verified', label: 'VERIFIED' } ];
    container.innerHTML = subTabs.map(tab => {
        const isActive = window.marketSubFilter === tab.id;
        return `<button onclick="window.setMarketSubFilter('${tab.id}', this)" class="px-3 py-1 text-[10px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${isActive ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">${tab.label}</button>`;
    }).join('');
}

window.filterMarket = function() {
    const query = document.getElementById('marketSearch').value.trim();
    window.marketSearchQuery = query.toLowerCase();
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    if (!query) { loadMarketData(); return; }
    window.searchTimeout = setTimeout(async () => {
        try {
            const grid = document.getElementById('marketGrid'); if (!grid) return;
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-muted-text font-bold uppercase tracking-widest"><i class="fas fa-circle-notch fa-spin mr-2"></i> Searching...</div>';
            const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?query=${encodeURIComponent(query)}`;
            const data = await window.fetchDirect(url);
            if (data && data.contracts) {
                window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
                window.marketTotalAvailable = window.marketTokens.length; renderMarketGrid();
            } else { window.marketTokens = []; window.marketTotalAvailable = 0; renderMarketGrid(); }
        } catch (e) {
            console.error('Search error:', e);
            const grid = document.getElementById('marketGrid'); if (grid) grid.innerHTML = '<div class="col-span-full text-center py-20 text-down font-bold uppercase tracking-widest">Search failed</div>';
        }
    }, 500);
};

window.loadMoreMarket = async function() {
    if (window.marketIsFetching) return;
    const btn = document.getElementById('loadMoreMarket');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> LOADING...'; }
    window.marketIsFetching = true;
    try {
        const nextPage = window.marketPage + 1;
        const type = (window.marketFilter === 'nonpump') ? 'nonpump' : (window.marketFilter === 'pumping') ? 'pumping' : 'all';
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${nextPage}&type=${type}`;
        const data = await window.fetchDirect(url);
        if (data && data.contracts && data.contracts.length > 0) {
            window.marketPage = nextPage;
            if (data.total || data.totals) window.marketTotalAvailable = data.total || data.totals;
            data.contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                if (!window.marketTokens.find(mt => mt.address === detail.address)) window.marketTokens.push(detail);
            });
            renderMarketGrid();
        } else { window.marketTotalAvailable = window.marketTokens.length; renderMarketGrid(); }
    } catch (e) { console.error('Load more failed:', e); }
    finally { window.marketIsFetching = false; if (btn && !btn.classList.contains('hidden')) { btn.disabled = false; btn.innerHTML = 'LOAD MORE'; } }
};

function renderMarketGrid() {
    const grid = document.getElementById('marketGrid'); if (!grid) return;
    let filtered = [...window.marketTokens];
    if (window.marketFilter === 'pumping') { filtered = filtered.filter(t => t.is_pump); filtered.sort((a, b) => b.volume_24h - a.volume_24h); }
    else if (window.marketFilter === 'verified') { filtered = filtered.filter(t => t.verified); filtered.sort((a, b) => b.volume_24h - a.volume_24h); }
    else if (window.marketFilter === 'nonpump') {
        filtered = filtered.filter(t => !t.is_pump);
        switch(window.marketSubFilter) {
            case 'new': filtered.sort((a, b) => b.id - a.id); break;
            case 'gainer': filtered.sort((a, b) => b.price_change_24h - a.price_change_24h); break;
            case 'marketcap': filtered.sort((a, b) => b.market_cap - a.market_cap); break;
            case 'verified': filtered = filtered.filter(t => t.verified); filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
            case 'hot': default: filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
        }
    } else {
        switch (window.marketFilter) {
            case 'new': filtered.sort((a, b) => b.id - a.id); break;
            case 'marketcap': filtered.sort((a, b) => b.market_cap - a.market_cap); break;
            case 'gainers': filtered.sort((a, b) => b.price_change_24h - a.price_change_24h); break;
            case 'hot': default: filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
        }
    }
    if (window.marketSearchQuery) {
        filtered = filtered.filter(t => t.symbol.toLowerCase().includes(window.marketSearchQuery) || t.address.toLowerCase().includes(window.marketSearchQuery) || t.name.toLowerCase().includes(window.marketSearchQuery));
    }
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-muted-text font-bold uppercase tracking-widest">No assets found</div>';
        const loadMoreBtn = document.getElementById('loadMoreMarket'); if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        return;
    }
    grid.innerHTML = filtered.map(t => {
        const change = (t.price_change_24h * 100).toFixed(2);
        const colorClass = t.price_change_24h >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-primary-text';
        const vol = window.formatAmount(t.volume_24h);
        const logoUrl = window.normalizeLogoUrl(t.logo);
        return `
            <a href="trade.html?token=${t.address}" class="bg-surface border-4 border-card p-4 md:p-6 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group block relative overflow-hidden">
                <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div class="relative flex-shrink-0">
                        ${logoUrl ? `<img src="${logoUrl}" class="w-10 h-10 md:w-12 md:h-12 border-2 border-card group-hover:rotate-6 transition-transform shadow-brutal-sm object-cover" onerror=\"this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');\">
                             <div class="hidden w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-card flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>` :
                            `<div class="w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-card flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>`
                        }
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-display text-lg md:text-2xl text-primary-text tracking-tighter uppercase italic break-all">${t.symbol}</span>
                            ${t.verified ? `<i class="fas fa-check-circle text-meme-cyan text-xs md:text-sm flex-shrink-0"></i>` : ''}
                        </div>
                        <div class="text-[8px] md:text-[10px] text-meme-cyan font-mono font-bold uppercase tracking-widest">PRC-20 ASSET</div>
                    </div>
                </div>
                <div class="space-y-3 md:space-y-4 relative z-10">
                    <div>
                        <div class="text-[8px] md:text-xs text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 italic">Price</div>
                        <div class="text-lg md:text-2xl font-display text-primary-text italic tracking-tight truncate">${t.price_paxi.toFixed(8)} <span class="text-meme-yellow text-xs">PAXI</span></div>
                    </div>
                    <div class="flex justify-between items-center pt-3 md:pt-4 border-t-2 border-card">
                        <div class="px-2 md:px-3 py-0.5 md:py-1 border-2 border-card font-display text-[10px] md:text-base ${colorClass}">${t.price_change_24h >= 0 ? '+' : ''}${change}%</div>
                        <div class="text-right">
                            <div class="text-[7px] md:text-[8px] text-muted-text font-mono font-bold uppercase tracking-widest italic">Volume</div>
                            <div class="text-[10px] md:text-base font-display text-meme-cyan italic tracking-tight">${vol}</div>
                        </div>
                    </div>
                    <div class="text-[8px] text-secondary-text font-mono mt-0.5" title="${t.address}">${t.address.slice(0, 6)}....${t.address.slice(-6)}</div>
                </div>
            </a>`;
    }).join('');
    const loadMoreBtn = document.getElementById('loadMoreMarket');
    if (loadMoreBtn) {
        if (window.marketTotalAvailable > window.marketTokens.length) loadMoreBtn.classList.remove('hidden');
        else loadMoreBtn.classList.add('hidden');
    }
}
window.loadMarketData = loadMarketData;
window.renderMarketGrid = renderMarketGrid;
window.renderMarketSubTabs = renderMarketSubTabs;
