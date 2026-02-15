/**
 * LANDING.JS - Landing Page Orchestration
 * Handles fetching and rendering for the homepage (index.html)
 */

window.addEventListener('load', async () => {
    // Only run on homepage
    if (!document.getElementById('trendingList')) return;

    console.log('🚀 Canonix Landing Page Initializing...');

    // Load data for all sections
    await Promise.all([
        loadTrendingTokens(),
        loadNewTokens(),
        loadVerifiedTokens()
    ]);
});

async function loadTrendingTokens() {
    try {
        // Trending sorted by Volume (Hot)
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=0&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            const processed = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            // Sort by volume descending
            const trending = processed.sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 10);
            renderLandingList('trendingList', trending);
        }
    } catch (e) {
        console.error('Failed to load trending tokens', e);
    }
}

async function loadNewTokens() {
    try {
        // New sorted by ID or timestamp
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=0&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            const processed = data.contracts.map(c => window.processTokenDetail(c.contract_address, c));
            // Sort by id descending (assuming higher ID is newer)
            const news = processed.sort((a, b) => b.id - a.id).slice(0, 10);
            renderLandingList('newList', news);
        }
    } catch (e) {
        console.error('Failed to load new tokens', e);
    }
}

async function loadVerifiedTokens() {
    try {
        // Non-pump (Verified)
        const url = `${window.APP_CONFIG.BACKEND_API}/token-list?type=nonpump&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            const processed = data.contracts
                .map(c => window.processTokenDetail(c.contract_address, c))
                .filter(t => t.is_pump === false); // Strictly Non-Pump

            // Trending Non-Pump (by volume)
            const trendingNp = [...processed].sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 10);
            renderLandingList('trendingNonPumpList', trendingNp);

            // New Non-Pump (by ID/Time)
            const newNp = [...processed].sort((a, b) => b.id - a.id).slice(0, 10);
            renderLandingList('newNonPumpList', newNp);
        }
    } catch (e) {
        console.error('Failed to load verified tokens', e);
    }
}

function renderLandingList(containerId, tokens) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tokens.length === 0) {
        container.innerHTML = '<div class="text-gray-500 text-sm py-4">No tokens found</div>';
        return;
    }

    container.innerHTML = tokens.map((t, index) => {
        const change = t.price_change_24h * 100;
        const colorClass = change >= 0 ? 'text-up' : 'text-down';
        const mcap = window.formatAmount(t.market_cap);
        const vol = window.formatAmount(t.volume_24h);

        return `
            <a href="trade.html?token=${t.address}" class="flex items-center justify-between p-4 bg-card/40 border border-border/50 rounded-2xl hover:border-up/50 transition-all group">
                <div class="flex items-center gap-4">
                    <span class="text-xs font-black text-gray-600 w-4">${index + 1}</span>
                    <div class="relative">
                        ${t.logo ?
                            `<img src="${t.logo}" class="w-10 h-10 rounded-full border border-border group-hover:scale-110 transition-transform">` :
                            `<div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-xs font-bold text-gray-500 border border-border">${t.symbol.charAt(0)}</div>`
                        }
                        ${t.verified ? `<div class="absolute -bottom-1 -right-1 text-[8px] text-blue-400 bg-bg rounded-full p-0.5"><i class="fas fa-check-circle"></i></div>` : ''}
                    </div>
                    <div>
                        <div class="font-black text-sm group-hover:text-up transition-colors">${t.symbol}</div>
                        <div class="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">MCap ${mcap}</div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-mono font-black ${colorClass}">${change >= 0 ? '+' : ''}${change.toFixed(2)}%</div>
                    <div class="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Vol ${vol}</div>
                </div>
            </a>
        `;
    }).join('');
}
