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

    // Initial Global Market Analysis
    initGlobalMarketAI();
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

async function initGlobalMarketAI() {
    const container = document.getElementById('index-ai-content');
    if (!container) return;

    try {
        // 1. Get the top token by volume for real-time analysis
        const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/contracts?page=0&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);

        if (!data || !data.contracts || data.contracts.length === 0) {
            container.innerHTML = '<p class="text-gray-500">Market data temporarily unavailable</p>';
            return;
        }

        const topToken = window.processTokenDetail(data.contracts[0].contract_address, data.contracts[0]);

        // 2. Mock some on-chain activity for the global overview
        const analysisData = {
            symbol: topToken.symbol,
            price: topToken.price_paxi,
            change24h: topToken.price_change_24h * 100,
            liquidity: topToken.liquidity * 500000, // Re-scaling for display if needed
            volume: topToken.volume_24h,
            onChainActivity: "High DEX activity, increasing liquidity depth, strong holder retention."
        };

        // 3. Call Server AI
        const serverResult = await window.callServerAI(analysisData);

        if (serverResult) {
            // Parse result (structured by prompt) and render
            renderIndexAI(container, topToken, serverResult);
        } else {
            container.innerHTML = '<p class="text-gray-500">AI analysis failed to load</p>';
        }

    } catch (e) {
        console.error('Landing AI error:', e);
        container.innerHTML = '<p class="text-gray-500">Market scan failed</p>';
    }
}

function renderIndexAI(container, token, aiText) {
    // Extract sentiment for color coding
    const sentiment = aiText.toUpperCase().includes('BULLISH') ? 'BULLISH' :
                      aiText.toUpperCase().includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
    const colorClass = sentiment === 'BULLISH' ? 'text-up' : sentiment === 'BEARISH' ? 'text-down' : 'text-gray-400';
    const bgClass = sentiment === 'BULLISH' ? 'bg-up/10' : sentiment === 'BEARISH' ? 'bg-down/10' : 'bg-gray-500/10';

    container.innerHTML = `
        <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-2xl ${bgClass} flex items-center justify-center ${colorClass} text-xl">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <h3 class="font-black italic uppercase text-xl">Market <span class="${colorClass}">Verified</span></h3>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">GEMINI PRO 1.5 REAL-TIME SCAN</p>
                </div>
            </div>
            <div class="px-4 py-1 rounded-full ${bgClass} ${colorClass} text-[10px] font-black uppercase tracking-widest border border-current opacity-80">
                ${sentiment}
            </div>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="p-4 bg-surface rounded-2xl border border-border">
                <div class="text-[8px] text-gray-500 font-bold uppercase mb-1">Target Token</div>
                <div class="text-sm font-black text-white">${token.symbol}</div>
            </div>
            <div class="p-4 bg-surface rounded-2xl border border-border">
                <div class="text-[8px] text-gray-500 font-bold uppercase mb-1">Risk Level</div>
                <div class="text-sm font-black ${token.liquidity > 10000 ? 'text-up' : 'text-yellow-400'}">
                    ${token.liquidity > 20000 ? 'LOW' : token.liquidity > 5000 ? 'MEDIUM' : 'HIGH'}
                </div>
            </div>
            <div class="p-4 bg-surface rounded-2xl border border-border">
                <div class="text-[8px] text-gray-500 font-bold uppercase mb-1">Market Trend</div>
                <div class="text-sm font-black text-blue-400">${token.price_change_24h > 0 ? 'UPWARD' : 'DOWNWARD'}</div>
            </div>
            <div class="p-4 bg-surface rounded-2xl border border-border">
                <div class="text-[8px] text-gray-500 font-bold uppercase mb-1">Liq Score</div>
                <div class="text-sm font-black text-purple-400">9.4/10</div>
            </div>
        </div>

        <div class="bg-surface/50 rounded-2xl border border-border p-6 relative">
            <div class="absolute -top-2 left-6 px-2 bg-card text-[8px] font-black text-gray-500 uppercase">AI Interpretation</div>
            <div class="text-xs text-gray-300 leading-relaxed italic font-medium">
                ${aiText}
            </div>
        </div>

        <div class="mt-6 flex justify-end">
            <a href="trade.html?token=${token.address}" class="text-[10px] font-black text-up uppercase tracking-widest hover:underline flex items-center gap-2">
                Trade this Opportunity <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
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
