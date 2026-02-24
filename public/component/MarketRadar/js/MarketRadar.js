window.UIManager.registerUI('MarketRadar', () => {
    return `
        <section id="market" class="py-12 bg-bg px-4">
            <div class="max-w-7xl mx-auto">
                <div class="flex flex-col lg:flex-row justify-between items-end gap-6 mb-10 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <div class="max-w-xl">
                        <h2 class="text-4xl font-display text-primary-text italic uppercase tracking-tighter mb-3 drop-shadow-[4px_4px_0_rgba(0,255,159,1)]">Market Radar</h2>
                        <p class="font-mono text-secondary-text font-black uppercase tracking-widest text-sm italic">Real-time data on trending tokens.</p>
                    </div>
                    <!-- Filters -->
                    <div class="flex flex-col gap-4">
                        <div class="flex flex-wrap gap-2" id="market-filter-btns">
                            <button data-filter="pumping" class="market-filter-btn px-4 py-2 bg-meme-green border-2 border-card text-black font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Pumping</button>
                            <button data-filter="hot" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Hot</button>
                            <button data-filter="new" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">New</button>
                            <button data-filter="marketcap" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Mcap</button>
                            <button data-filter="gainers" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Gainers</button>
                            <button data-filter="verified" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Verified</button>
                            <button data-filter="nonpump" class="market-filter-btn px-4 py-2 bg-surface border-2 border-card text-primary-text font-display text-lg italic uppercase shadow-brutal hover:shadow-none transition-all">Non-PUMP</button>
                        </div>
                        <div id="marketSubTabs" class="hidden flex flex-wrap gap-2 p-3 bg-card border-2 border-card shadow-brutal-sm rotate-[-0.5deg]">
                            <!-- JS Populated -->
                        </div>
                    </div>
                </div>

                <!-- Search -->
                <div class="mb-10 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <div class="relative">
                        <i class="fas fa-search absolute left-6 top-1/2 -translate-y-1/2 text-meme-cyan text-lg"></i>
                        <input type="text" id="marketSearch" placeholder="SEARCH TOKENS..."
                               class="w-full pl-14 pr-6 py-4 bg-surface border-4 border-card text-xl font-display outline-none focus:border-meme-pink transition-all text-primary-text placeholder:text-muted-text italic uppercase">
                    </div>
                </div>

                <!-- Grid -->
                <div id="marketGrid" class="grid grid-cols-2 gap-3 md:gap-6 reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <!-- JS Populated -->
                    <div class="animate-pulse bg-card border-4 border-card h-64"></div>
                    <div class="animate-pulse bg-card border-4 border-card h-64"></div>
                </div>

                <div class="mt-16 text-center reveal active opacity-100 translate-y-0 transition-all duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <button id="loadMoreMarket" class="bg-meme-cyan text-black font-display text-3xl px-12 py-5 border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">LOAD MORE</button>
                </div>
            </div>
        </section>
    `;
});

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

window.setMarketSubFilter = function(subType) {
    window.marketSubFilter = subType; renderMarketSubTabs(); renderMarketGrid();
};

function renderMarketSubTabs() {
    const container = document.getElementById('marketSubTabs');
    if (!container) return;
    const subTabs = [ { id: 'all', label: 'ALL NON-PUMP' }, { id: 'new', label: 'NEW' }, { id: 'gainer', label: 'GAINER' }, { id: 'hot', label: 'HOT' }, { id: 'marketcap', label: 'MCAP' }, { id: 'verified', label: 'VERIFIED' } ];

    container.innerHTML = '';
    subTabs.forEach(tab => {
        const isActive = window.marketSubFilter === tab.id;
        const btn = document.createElement('button');
        btn.className = `px-3 py-1 text-[10px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${isActive ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}`;
        btn.textContent = tab.label;
        btn.onclick = () => window.setMarketSubFilter(tab.id);
        container.appendChild(btn);
    });
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
