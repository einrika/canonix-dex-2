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

    // Update UI buttons - Brutal Style
    document.querySelectorAll('.market-filter-btn').forEach(b => {
        b.classList.remove('bg-meme-green', 'text-black');
        b.classList.add('bg-meme-bg', 'text-white');
    });

    if (btn) {
        btn.classList.add('bg-meme-green', 'text-black');
        btn.classList.remove('bg-meme-bg', 'text-white');
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
        const colorClass = t.price_change_24h >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-white';
        const shadowClass = t.price_change_24h >= 0 ? 'shadow-brutal-green' : 'shadow-brutal-pink';
        const vol = window.formatAmount(t.volume_24h);

        return `
            <a href="trade.html?token=${t.address}" class="bg-meme-surface border-4 border-black p-8 ${shadowClass} hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all group block relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 -rotate-45 translate-x-16 -translate-y-16 group-hover:bg-white/10 transition-colors"></div>

                <div class="flex items-center gap-6 mb-10">
                    <div class="relative flex-shrink-0">
                        ${t.logo ?
                            `<img src="${t.logo}" class="w-16 h-16 rounded-none border-4 border-black group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-brutal">` :
                            `<div class="w-16 h-16 bg-meme-yellow border-4 border-black flex items-center justify-center text-xl font-display text-black group-hover:rotate-6 transition-transform shadow-brutal">${t.symbol.charAt(0)}</div>`
                        }
                    </div>
                    <div class="min-w-0">
                        <div class="flex items-center gap-2">
                            <span class="font-display text-3xl text-white tracking-tight uppercase italic truncate">${t.symbol}</span>
                            ${t.verified ? `<i class="fas fa-check-circle text-meme-cyan text-sm"></i>` : ''}
                        </div>
                        <div class="text-[10px] text-meme-cyan font-mono font-bold uppercase tracking-[0.2em]">PRC-20 ASSET</div>
                    </div>
                </div>

                <div class="space-y-6 relative z-10">
                    <div>
                        <div class="text-xs text-gray-500 font-mono font-bold uppercase tracking-widest mb-2">CURRENT PRICE</div>
                        <div class="text-3xl font-display text-white italic tracking-tight truncate">${t.price_paxi.toFixed(8)} <span class="text-meme-yellow">PAXI</span></div>
                    </div>

                    <div class="flex justify-between items-center pt-6 border-t-4 border-black">
                        <div class="px-4 py-1.5 border-2 border-black font-display text-xl ${colorClass}">
                            ${t.price_change_24h >= 0 ? '+' : ''}${change}%
                        </div>
                        <div class="text-right">
                            <div class="text-[10px] text-gray-600 font-mono font-bold uppercase tracking-widest">24H VOLUME</div>
                            <div class="text-lg font-display text-meme-cyan italic tracking-tight">${vol}</div>
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
    const colorClass = sentiment === 'BULLISH' ? 'text-meme-green' : sentiment === 'BEARISH' ? 'text-meme-pink' : 'text-meme-cyan';
    const bgClass = sentiment === 'BULLISH' ? 'bg-meme-green' : sentiment === 'BEARISH' ? 'bg-meme-pink' : 'bg-meme-cyan';

    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-12 mb-16">
            <div class="flex items-center gap-8">
                <div class="w-24 h-24 bg-surface border-4 border-black flex items-center justify-center ${colorClass} text-5xl shadow-brutal rotate-[-5deg]">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <h3 class="font-display italic uppercase text-6xl tracking-tighter">AI <span class="${colorClass}">SCAN</span></h3>
                    <p class="font-mono text-sm text-gray-600 font-bold uppercase tracking-[0.4em]">GEMINI PRO 1.5 VERIFIED</p>
                </div>
            </div>
            <div class="px-10 py-4 bg-black border-4 border-current ${colorClass} font-display text-4xl shadow-brutal rotate-[2deg]">
                ${sentiment} VIBES
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            <div class="p-8 bg-meme-surface border-4 border-black shadow-brutal">
                <div class="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-3">TARGET</div>
                <div class="text-4xl font-display text-white italic tracking-tight">${token.symbol}</div>
            </div>
            <div class="p-8 bg-meme-surface border-4 border-black shadow-brutal">
                <div class="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-3">RISK LVL</div>
                <div class="text-4xl font-display ${token.liquidity > 10000 ? 'text-meme-green' : 'text-meme-yellow'} italic tracking-tight">
                    ${token.liquidity > 20000 ? 'GIGA' : token.liquidity > 5000 ? 'MID' : 'REKT'}
                </div>
            </div>
            <div class="p-8 bg-meme-surface border-4 border-black shadow-brutal">
                <div class="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-3">TREND</div>
                <div class="text-4xl font-display text-meme-cyan italic tracking-tight">${token.price_change_24h > 0 ? 'MOON' : 'BLEED'}</div>
            </div>
            <div class="p-8 bg-meme-surface border-4 border-black shadow-brutal">
                <div class="text-[10px] text-gray-500 font-mono font-bold uppercase tracking-widest mb-3">BRAIN</div>
                <div class="text-4xl font-display text-white italic tracking-tight">9.8/10</div>
            </div>
        </div>

        <div class="bg-meme-surface border-4 border-black p-10 relative overflow-hidden group shadow-brutal">
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

        <div class="mt-16 flex justify-end">
            <a href="trade.html?token=${token.address}" class="px-12 py-5 bg-meme-green text-black font-display text-4xl border-4 border-black shadow-brutal hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center gap-6 rotate-[-1deg]">
                APE IN <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
}
