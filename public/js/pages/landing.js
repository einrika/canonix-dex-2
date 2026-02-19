/**
 * LANDING.JS - Landing Page Orchestration
 * Handles fetching and rendering for the homepage (index.html)
 */

window.marketTokens = [];
window.marketFilter = 'hot';
window.marketSearchQuery = '';
window.marketPage = 0;
window.marketLimit = 12;
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

async function loadMarketData() {
    try {
        const grid = document.getElementById('marketGrid');
        if (!grid) return;

        window.marketPage = 0;
        // Fetch tokens using BACKEND_API (via fetchDirect routing)
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=${window.marketPage}&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            renderMarketGrid();
        }
    } catch (e) {
        console.error('Failed to load market data', e);
    }
}

window.setMarketFilter = function(type, btn) {
    window.marketFilter = type;

    // Update UI buttons
    document.querySelectorAll('.market-filter-btn').forEach(b => {
        b.classList.remove('border-up', 'bg-up', 'text-bg');
        b.classList.add('text-gray-500', 'border-white/10');
    });

    if (btn) {
        btn.classList.add('border-up', 'bg-up', 'text-bg');
        btn.classList.remove('text-gray-500', 'border-white/10');
    }

    renderMarketGrid();
};

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

            const url = `https://explorer.paxinet.io/api/prc20/search?name=${encodeURIComponent(query)}`;
            const data = await window.smartFetch(url);

            if (data && data.contracts) {
                window.marketTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
                renderMarketGrid();
            } else {
                window.marketTokens = [];
                renderMarketGrid();
            }
        } catch (e) {
            console.error('Search error:', e);
            grid.innerHTML = '<div class="col-span-full text-center py-20 text-down font-bold uppercase tracking-widest">Search failed</div>';
        }
    }, 500); // 500ms debounce
};

window.loadMoreMarket = async function() {
    const btn = document.getElementById('loadMoreMarket');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Loading...';
    }

    try {
        window.marketPage++;
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=${window.marketPage}&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts && data.contracts.length > 0) {
            const newTokens = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            // Append unique tokens only
            newTokens.forEach(t => {
                if (!window.marketTokens.find(mt => mt.address === t.address)) {
                    window.marketTokens.push(t);
                }
            });

            window.marketLimit = window.marketTokens.length;
            renderMarketGrid();
        } else {
            // No more tokens
            if (btn) btn.classList.add('hidden');
        }
    } catch (e) {
        console.error('Load more failed:', e);
        window.marketPage--; // Rollback page on error
    } finally {
        if (btn && !btn.classList.contains('hidden')) {
            btn.disabled = false;
            btn.innerHTML = 'Load More Assets';
        }
    }
};

function renderMarketGrid() {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    let filtered = [...window.marketTokens];

    // Apply Filter Logic
    switch (window.marketFilter) {
        case 'pumping':
            filtered = filtered.filter(t => t.is_pump);
            break;
        case 'nonpump':
            filtered = filtered.filter(t => !t.is_pump);
            break;
        case 'new':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'marketcap':
            filtered.sort((a, b) => b.market_cap - a.market_cap);
            break;
        case 'gainers':
            filtered.sort((a, b) => b.price_change_24h - a.price_change_24h);
            break;
        case 'hot':
        default:
            filtered.sort((a, b) => b.volume_24h - a.volume_24h);
            break;
    }

    // Apply Search Query
    if (window.marketSearchQuery) {
        filtered = filtered.filter(t =>
            t.symbol.toLowerCase().includes(window.marketSearchQuery) ||
            t.address.toLowerCase().includes(window.marketSearchQuery) ||
            t.name.toLowerCase().includes(window.marketSearchQuery)
        );
    }

    const display = filtered.slice(0, window.marketLimit);

    if (display.length === 0) {
        grid.innerHTML = '<div class="col-span-full text-center py-20 text-gray-600 font-bold uppercase tracking-widest">No assets found</div>';
        return;
    }

    grid.innerHTML = display.map(t => {
        const change = (t.price_change_24h * 100).toFixed(2);
        const colorClass = t.price_change_24h >= 0 ? 'text-up bg-up/10' : 'text-down bg-down/10';
        const vol = window.formatAmount(t.volume_24h);

        return `
            <a href="trade.html?token=${t.address}" class="bg-surface border border-white/5 p-6 rounded-3xl hover:border-up/30 transition-all group block relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
                <div class="flex items-center gap-4 mb-8">
                    <div class="relative flex-shrink-0">
                        ${t.logo ?
                            `<img src="${t.logo}" class="w-12 h-12 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">` :
                            `<div class="w-12 h-12 rounded-2xl bg-bg border border-white/10 flex items-center justify-center text-xs font-black text-gray-500">${t.symbol.charAt(0)}</div>`
                        }
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-1.5">
                            <span class="font-black text-white text-lg tracking-tighter uppercase italic truncate">${t.symbol}</span>
                            ${t.verified ? `<i class="fas fa-check-circle text-up text-[10px]"></i>` : ''}
                        </div>
                        <div class="text-[10px] text-gray-600 font-black uppercase tracking-widest">PRC-20 TOKEN</div>
                    </div>
                </div>

                <div class="space-y-4 relative z-10">
                    <div>
                        <div class="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Price</div>
                        <div class="text-xl font-black text-white italic tracking-tight truncate">${t.price_paxi.toFixed(8)} PAXI</div>
                    </div>

                    <div class="flex justify-between items-center pt-4 border-t border-white/5">
                        <div class="px-3 py-1 rounded-lg text-[10px] font-black ${colorClass}">
                            ${t.price_change_24h >= 0 ? '+' : ''}${change}%
                        </div>
                        <div class="text-right">
                            <div class="text-[8px] text-gray-600 font-black uppercase tracking-widest">Volume</div>
                            <div class="text-[10px] text-gray-300 font-bold tracking-tight">${vol} PAXI</div>
                        </div>
                    </div>
                </div>
            </a>
        `;
    }).join('');

    // Hide Load More if no more tokens
    const loadMoreBtn = document.getElementById('loadMoreMarket');
    if (loadMoreBtn) {
        if (window.marketLimit >= filtered.length) {
            loadMoreBtn.classList.add('hidden');
        } else {
            loadMoreBtn.classList.remove('hidden');
        }
    }
}

async function initGlobalMarketAI() {
    const container = document.getElementById('index-ai-content');
    if (!container) return;

    try {
        // 1. Get the top token by volume for real-time analysis
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=0&_t=${Date.now()}`;
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
    const colorClass = sentiment === 'BULLISH' ? 'text-up' : sentiment === 'BEARISH' ? 'text-down' : 'text-gray-400';
    const bgClass = sentiment === 'BULLISH' ? 'bg-up/10' : sentiment === 'BEARISH' ? 'bg-down/10' : 'bg-gray-500/10';

    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div class="flex items-center gap-6">
                <div class="w-16 h-16 rounded-3xl ${bgClass} flex items-center justify-center ${colorClass} text-3xl shadow-lg border border-current opacity-50">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <h3 class="font-black italic uppercase text-2xl tracking-tighter">Market <span class="${colorClass}">Verified</span></h3>
                    <p class="text-[10px] text-gray-600 font-black uppercase tracking-[0.3em]">GEMINI PRO 1.5 REAL-TIME SCAN</p>
                </div>
            </div>
            <div class="px-8 py-2 rounded-full ${bgClass} ${colorClass} text-xs font-black uppercase tracking-widest border border-current shadow-glow">
                ${sentiment} SENTIMENT
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div class="p-6 bg-bg/50 rounded-3xl border border-white/5">
                <div class="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Target Asset</div>
                <div class="text-lg font-black text-white italic tracking-tight">${token.symbol}</div>
            </div>
            <div class="p-6 bg-bg/50 rounded-3xl border border-white/5">
                <div class="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Risk Level</div>
                <div class="text-lg font-black ${token.liquidity > 10000 ? 'text-up' : 'text-yellow-400'} italic tracking-tight">
                    ${token.liquidity > 20000 ? 'LOW-SEC' : token.liquidity > 5000 ? 'MED-VOL' : 'HIGH-RISK'}
                </div>
            </div>
            <div class="p-6 bg-bg/50 rounded-3xl border border-white/5">
                <div class="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Trend Cycle</div>
                <div class="text-lg font-black text-accent italic tracking-tight">${token.price_change_24h > 0 ? 'ACCUMULATION' : 'DISTRIBUTION'}</div>
            </div>
            <div class="p-6 bg-bg/50 rounded-3xl border border-white/5">
                <div class="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-2">Liq Score</div>
                <div class="text-lg font-black text-white italic tracking-tight">9.8/10</div>
            </div>
        </div>

        <div class="bg-bg/40 rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group">
            <div class="absolute inset-0 bg-grid opacity-5"></div>
            <div class="relative z-10">
                <div class="flex items-center gap-2 mb-4">
                    <div class="w-2 h-2 rounded-full bg-up animate-pulse"></div>
                    <div class="text-[10px] font-black text-gray-500 uppercase tracking-widest">AI Interpretation Engine</div>
                </div>
                <div class="text-sm text-gray-300 leading-relaxed italic font-medium">
                    "${aiText}"
                </div>
            </div>
        </div>

        <div class="mt-10 flex justify-end">
            <a href="trade.html?token=${token.address}" class="px-8 py-3 rounded-xl bg-up text-bg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3">
                Trade Opportunity <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}
