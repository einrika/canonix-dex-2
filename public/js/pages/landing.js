/**
 * LANDING.JS - Landing Page Orchestration
 * Handles fetching and rendering for the homepage (index.html)
 */

window.marketTokens = [];
window.marketFilter = 'hot';
window.marketSubFilter = 'all';
window.marketSearchQuery = '';
window.marketPage = 0;
window.marketLimit = 12;
window.marketTotalAvailable = 0;  // ✅ FIX: Track total dari API
window.marketIsFetching = false;  // ✅ FIX: Guard double-fetch
window.searchTimeout = null;

window.addEventListener('load', async () => {
    // Only run on homepage
    if (!document.getElementById('marketGrid')) return;

    console.log('🚀 Canonix Landing Page Initializing...');

    // Load initial market data
    await loadMarketData();

    // Initial Global Market Analysis
    initGlobalMarketAI();
});

async function loadMarketData(type = 'all') {
    try {
        const grid = document.getElementById('marketGrid');
        if (!grid) return;

        // Show loading state
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-600 font-bold uppercase tracking-widest"><div class="w-10 h-10 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>SYNCING...</div>';

        window.marketPage = 0;
        window.marketTokens = []; // ✅ FIX: Reset array saat load awal

        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${window.marketPage}&type=${type}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            window.marketTotalAvailable = data.total || data.totals || 0; // ✅ FIX: Simpan total dari API
            renderMarketGrid();
        }
    } catch (e) {
        console.error('Failed to load market data', e);
    }
}

window.setMarketFilter = function(type, btn) {
    window.marketFilter = type;
    window.marketSubFilter = 'all'; // Reset sub-filter

    // Update UI buttons - Brutal Style
    document.querySelectorAll('.market-filter-btn').forEach(b => {
        b.classList.remove('bg-meme-green', 'text-black');
        b.classList.add('bg-black', 'text-white');
    });

    if (btn) {
        btn.classList.add('bg-meme-green', 'text-black');
        btn.classList.remove('bg-black', 'text-white');
    } else {
        document.querySelectorAll('.market-filter-btn').forEach(b => {
            if (b.getAttribute('onclick')?.includes(`'${type}'`)) {
                b.classList.add('bg-meme-green', 'text-black');
                b.classList.remove('bg-black', 'text-white');
            }
        });
    }

    // Handle Sub-Tabs UI
    const subTabsContainer = document.getElementById('marketSubTabs');
    if (type === 'nonpump') {
        subTabsContainer.classList.remove('hidden');
        renderMarketSubTabs();
        loadMarketData('nonpump');
    } else {
        subTabsContainer.classList.add('hidden');
        loadMarketData(type === 'verified' ? 'all' : 'all');
    }
};

window.setMarketSubFilter = function(subType, btn) {
    window.marketSubFilter = subType;
    renderMarketSubTabs();
    renderMarketGrid();
};

function renderMarketSubTabs() {
    const container = document.getElementById('marketSubTabs');
    if (!container) return;

    const subTabs = [
        { id: 'all', label: 'ALL NON-PUMP' },
        { id: 'new', label: 'NEW' },
        { id: 'gainer', label: 'GAINER' },
        { id: 'hot', label: 'HOT' },
        { id: 'marketcap', label: 'MCAP' },
        { id: 'verified', label: 'VERIFIED' }
    ];

    container.innerHTML = subTabs.map(tab => {
        const isActive = window.marketSubFilter === tab.id;
        return `<button onclick="window.setMarketSubFilter('${tab.id}', this)"
            class="px-3 py-1 text-[10px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none
            ${isActive ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">${tab.label}</button>`;
    }).join('');
}

window.filterMarket = function() {
    const query = document.getElementById('marketSearch').value.trim();
    window.marketSearchQuery = query.toLowerCase();

    // Clear existing timeout
    if (window.searchTimeout) clearTimeout(window.searchTimeout);

    // If query is empty, reload initial market data
    if (!query) {
        loadMarketData();
        return;
    }

    // Debounce search API call
    window.searchTimeout = setTimeout(async () => {
        try {
            const grid = document.getElementById('marketGrid');
            if (!grid) return;

            // Show loading state
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-600 font-bold uppercase tracking-widest"><i class="fas fa-circle-notch fa-spin mr-2"></i> Searching...</div>';

            const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?query=${encodeURIComponent(query)}`;
            const data = await window.fetchDirect(url);

            if (data && data.contracts) {
                window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
                window.marketTotalAvailable = window.marketTokens.length; // search = tidak ada load more
                renderMarketGrid();
            } else {
                window.marketTokens = [];
                window.marketTotalAvailable = 0;
                renderMarketGrid();
            }
        } catch (e) {
            console.error('Search error:', e);
            const grid = document.getElementById('marketGrid');
            if (grid) grid.innerHTML = '<div class="col-span-full text-center py-20 text-down font-bold uppercase tracking-widest">Search failed</div>';
        }
    }, 500); // 500ms debounce
};

// ✅ FIX: loadMoreMarket — fetch + append + guard isFetching
window.loadMoreMarket = async function() {
    if (window.marketIsFetching) return; // ✅ Guard double-click

    const btn = document.getElementById('loadMoreMarket');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> LOADING...';
    }

    window.marketIsFetching = true;

    try {
        const nextPage = window.marketPage + 1;
        const type = (window.marketFilter === 'nonpump') ? 'nonpump' : (window.marketFilter === 'pumping') ? 'pumping' : 'all';
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${nextPage}&type=${type}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts && data.contracts.length > 0) {
            window.marketPage = nextPage; // ✅ Hanya update page kalau berhasil

            if (data.total || data.totals) {
                window.marketTotalAvailable = data.total || data.totals; // ✅ Update total
            }

            // ✅ Append token baru, skip duplikat
            data.contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                if (!window.marketTokens.find(mt => mt.address === detail.address)) {
                    window.marketTokens.push(detail);
                }
            });

            renderMarketGrid();
        } else {
            // Tidak ada data lagi
            window.marketTotalAvailable = window.marketTokens.length; // ✅ Stop load more
            renderMarketGrid();
        }
    } catch (e) {
        console.error('Load more failed:', e);
        // Tidak rollback marketPage karena nextPage belum di-assign
    } finally {
        window.marketIsFetching = false;
        if (btn && !btn.classList.contains('hidden')) {
            btn.disabled = false;
            btn.innerHTML = 'LOAD MORE';
        }
    }
};

function renderMarketGrid() {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    let filtered = [...window.marketTokens];

    // Apply Filter Logic
    if (window.marketFilter === 'pumping') {
        filtered = filtered.filter(t => t.is_pump);
        filtered.sort((a, b) => b.volume_24h - a.volume_24h);
    } else if (window.marketFilter === 'verified') {
        filtered = filtered.filter(t => t.verified);
        filtered.sort((a, b) => b.volume_24h - a.volume_24h);
    } else if (window.marketFilter === 'nonpump') {
        filtered = filtered.filter(t => !t.is_pump);

        // Apply sub-filter sorting/filtering
        switch(window.marketSubFilter) {
            case 'new': filtered.sort((a, b) => b.id - a.id); break;
            case 'gainer': filtered.sort((a, b) => b.price_change_24h - a.price_change_24h); break;
            case 'marketcap': filtered.sort((a, b) => b.market_cap - a.market_cap); break;
            case 'verified': filtered = filtered.filter(t => t.verified); filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
            case 'hot':
            default: filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
        }
    } else {
        // Standard filters
        switch (window.marketFilter) {
            case 'new': filtered.sort((a, b) => b.id - a.id); break;
            case 'marketcap': filtered.sort((a, b) => b.market_cap - a.market_cap); break;
            case 'gainers': filtered.sort((a, b) => b.price_change_24h - a.price_change_24h); break;
            case 'hot':
            default: filtered.sort((a, b) => b.volume_24h - a.volume_24h); break;
        }
    }

    // Apply Search Query
    if (window.marketSearchQuery) {
        filtered = filtered.filter(t =>
            t.symbol.toLowerCase().includes(window.marketSearchQuery) ||
            t.address.toLowerCase().includes(window.marketSearchQuery) ||
            t.name.toLowerCase().includes(window.marketSearchQuery)
        );
    }

    // ✅ FIX: Tampilkan semua token yang sudah di-fetch, tanpa slice by marketLimit
    const display = filtered;

    if (display.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-600 font-bold uppercase tracking-widest">No assets found</div>';
        // Sembunyikan tombol load more saat kosong
        const loadMoreBtn = document.getElementById('loadMoreMarket');
        if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
        return;
    }

    grid.innerHTML = display.map(t => {
        const change = (t.price_change_24h * 100).toFixed(2);
        const colorClass = t.price_change_24h >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-white';
        const vol = window.formatAmount(t.volume_24h);
        const logoUrl = window.normalizeLogoUrl(t.logo);

        return `
            <a href="trade.html?token=${t.address}" class="bg-meme-surface border-4 border-black p-4 md:p-6 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group block relative overflow-hidden">
                <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div class="relative flex-shrink-0">
                        ${logoUrl ?
                            `<img src="${logoUrl}" class="w-10 h-10 md:w-12 md:h-12 border-2 border-black group-hover:rotate-6 transition-transform shadow-brutal-sm object-cover" onerror=\"this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');\">
                             <div class="hidden w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-black flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>` :
                            `<div class="w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-black flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>`
                        }
                    </div>
                    <div class="flex-1 overflow-hidden">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="font-display text-lg md:text-2xl text-white tracking-tighter uppercase italic break-all">${t.symbol}</span>
                            ${t.verified ? `<i class="fas fa-check-circle text-meme-cyan text-xs md:text-sm flex-shrink-0"></i>` : ''}
                        </div>
                        <div class="text-[8px] md:text-[10px] text-meme-cyan font-mono font-bold uppercase tracking-widest">PRC-20 ASSET</div>
                    </div>
                </div>

                <div class="space-y-3 md:space-y-4 relative z-10">
                    <div>
                        <div class="text-[8px] md:text-xs text-gray-500 font-mono font-bold uppercase tracking-widest mb-1 italic">Price</div>
                        <div class="text-lg md:text-2xl font-display text-white italic tracking-tight truncate">${t.price_paxi.toFixed(8)} <span class="text-meme-yellow text-xs">PAXI</span></div>
                    </div>

                    <div class="flex justify-between items-center pt-3 md:pt-4 border-t-2 border-black">
                        <div class="px-2 md:px-3 py-0.5 md:py-1 border-2 border-black font-display text-[10px] md:text-base ${colorClass}">
                            ${t.price_change_24h >= 0 ? '+' : ''}${change}%
                        </div>
                        <div class="text-right">
                            <div class="text-[7px] md:text-[8px] text-gray-600 font-mono font-bold uppercase tracking-widest italic">Volume</div>
                            <div class="text-[10px] md:text-base font-display text-meme-cyan italic tracking-tight">${vol}</div>
                        </div>
                    </div>
                    <div class="text-[8px] text-gray-500 font-mono mt-0.5" title="${t.address}">${t.address.slice(0, 6)}....${t.address.slice(-6)}</div>
                </div>
            </a>
        `;
    }).join('');

    // ✅ FIX: Tampilkan/sembunyikan tombol Load More berdasarkan total dari API
    const loadMoreBtn = document.getElementById('loadMoreMarket');
    if (loadMoreBtn) {
        const hasMore = window.marketTotalAvailable > window.marketTokens.length;
        if (hasMore) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }
}

async function initGlobalMarketAI() {
    const container = document.getElementById('index-ai-content');
    if (!container) return;

    try {
        // 1. Get the top token by volume for real-time analysis
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
        const data = await window.fetchDirect(url);

        if (!data || !data.contracts || data.contracts.length === 0) {
            container.innerHTML = '<p class="text-gray-600 font-black uppercase tracking-widest text-sm">Market scan currently restricted</p>';
            return;
        }

        const topToken = window.processTokenDetail(data.contracts[0].contract_address, data.contracts[0]);

        // 2. Mock some on-chain activity for the global overview
        const analysisData = {
            symbol: topToken.symbol,
            price: topToken.price_paxi,
            change24h: topToken.price_change_24h * 100,
            liquidity: topToken.liquidity * 500000,
            volume: topToken.volume_24h,
            onChainActivity: "High DEX activity, increasing liquidity depth, strong holder retention."
        };

        // 3. Call Server AI
        const serverResult = await window.callServerAI(analysisData);

        if (serverResult) {
            renderIndexAI(container, topToken, serverResult);
        } else {
            container.innerHTML = '<p class="text-gray-600 font-black uppercase tracking-widest text-sm">AI pipeline offline</p>';
        }

    } catch (e) {
        console.error('Landing AI error:', e);
        container.innerHTML = '<p class="text-gray-600 font-black uppercase tracking-widest text-sm">Scan failed</p>';
    }
}

function renderIndexAI(container, token, aiText) {
    const sentiment = aiText.toUpperCase().includes('BULLISH') ? 'BULLISH' :
                      aiText.toUpperCase().includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
    const colorClass = sentiment === 'BULLISH' ? 'text-meme-green' : sentiment === 'BEARISH' ? 'text-meme-pink' : 'text-meme-cyan';
    const bgClass = sentiment === 'BULLISH' ? 'bg-meme-green' : sentiment === 'BEARISH' ? 'bg-meme-pink' : 'bg-meme-cyan';

    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12 mb-6 md:mb-12">
            <div class="flex items-center gap-4 md:gap-6">
                <div class="w-12 h-12 md:w-20 md:h-20 bg-meme-surface border-2 md:border-4 border-black flex items-center justify-center ${colorClass} text-xl md:text-4xl shadow-[4px_4px_0_0_#000] md:shadow-brutal rotate-[-5deg]">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <h3 class="font-display italic uppercase text-2xl md:text-4xl tracking-tighter">AI <span class="${colorClass}">ANALYSIS</span></h3>
                    <p class="font-mono text-[8px] md:text-xs text-gray-600 font-bold uppercase tracking-[0.4em]">GEMINI PRO 1.5 VERIFIED</p>
                </div>
            </div>
            <div class="px-4 md:px-8 py-1.5 md:py-3 bg-black border-2 md:border-4 border-current ${colorClass} font-display text-lg md:text-2xl shadow-[4px_4px_0_0_#000] md:shadow-brutal rotate-[2deg]">
                ${sentiment} VIBES
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-12">
            <div class="p-4 md:p-6 bg-meme-surface border-2 md:border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">TARGET</div>
                <div class="text-lg md:text-2xl font-display text-white italic tracking-tight">${token.symbol}</div>
            </div>
            <div class="p-4 md:p-6 bg-meme-surface border-2 md:border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">RISK LVL</div>
                <div class="text-lg md:text-2xl font-display ${token.liquidity > 10000 ? 'text-meme-green' : 'text-meme-yellow'} italic tracking-tight">
                    ${token.liquidity > 20000 ? 'GIGA' : token.liquidity > 5000 ? 'MID' : 'REKT'}
                </div>
            </div>
            <div class="p-4 md:p-6 bg-meme-surface border-2 md:border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">TREND</div>
                <div class="text-lg md:text-2xl font-display text-meme-cyan italic tracking-tight">${token.price_change_24h > 0 ? 'MOON' : 'BLEED'}</div>
            </div>
            <div class="p-4 md:p-6 bg-meme-surface border-2 md:border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">BRAIN</div>
                <div class="text-lg md:text-2xl font-display text-white italic tracking-tight">9.8/10</div>
            </div>
        </div>

        <div class="bg-meme-surface border-2 md:border-4 border-black p-4 md:p-10 relative overflow-hidden group shadow-[4px_4px_0_0_#000] md:shadow-brutal">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-10"></div>
            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-4 h-4 bg-meme-green animate-ping"></div>
                    <div class="font-mono text-sm font-bold text-gray-500 uppercase tracking-widest">AI INTERPRETATION OUTPUT</div>
                </div>
                <div class="text-2xl text-gray-300 leading-tight italic font-mono">
                    "${aiText}"
                </div>
            </div>
        </div>

        <div class="mt-8 md:mt-10 flex justify-end">
            <a href="trade.html?token=${token.address}" class="px-8 md:px-10 py-3 md:py-4 bg-meme-green text-black font-display text-xl md:text-3xl border-2 md:border-4 border-black shadow-[4px_4px_0_0_#000] md:shadow-brutal hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] hover:shadow-none transition-all flex items-center gap-3 md:gap-5 rotate-[-1deg]">
                TRADE NOW <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}
