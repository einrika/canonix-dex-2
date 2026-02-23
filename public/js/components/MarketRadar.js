// ============================================
// MARKETRADAR COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';

export const MarketRadar = {
    render: () => {
        return `
            <div id="marketRadar" class="bg-surface border-4 border-card p-8 md:p-12 relative overflow-hidden shadow-brutal mb-20">
                <div class="absolute top-0 right-0 w-64 h-64 bg-meme-green/5 blur-3xl -z-10"></div>

                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div class="flex items-center gap-6">
                        <div class="w-16 h-16 bg-card border-2 border-meme-green flex items-center justify-center text-meme-green text-3xl shadow-brutal-sm rotate-[5deg] animate-pulse">
                            <i class="fas fa-satellite-dish"></i>
                        </div>
                        <div>
                            <h2 class="font-display text-4xl md:text-6xl italic uppercase tracking-tighter">Market <span class="text-meme-green">Radar</span></h2>
                            <p class="font-mono text-xs text-muted-text uppercase tracking-widest font-bold italic">Real-time Signal Extraction</p>
                        </div>
                    </div>
                    <div class="px-6 py-2 bg-card border-2 border-card font-mono text-[10px] text-meme-green uppercase tracking-widest font-black">
                        System Status: Scanning
                    </div>
                </div>

                <div id="radarGrid" class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- High liquidity signals -->
                    <div class="space-y-4">
                        <h3 class="font-display text-xl text-meme-cyan italic uppercase flex items-center gap-2">
                            <i class="fas fa-tint"></i> Liquidity GEMS
                        </h3>
                        <div id="liquidityGems" class="space-y-2">
                            <div class="p-4 bg-card/50 border border-card font-mono text-[10px] text-muted-text uppercase">Awaiting Deep Scanning...</div>
                        </div>
                    </div>

                    <!-- Volume Spikes -->
                    <div class="space-y-4">
                        <h3 class="font-display text-xl text-meme-yellow italic uppercase flex items-center gap-2">
                            <i class="fas fa-chart-line"></i> Volume SPIKES
                        </h3>
                        <div id="volumeSpikes" class="space-y-2">
                            <div class="p-4 bg-card/50 border border-card font-mono text-[10px] text-muted-text uppercase">Monitoring Activity...</div>
                        </div>
                    </div>

                    <!-- New Signals -->
                    <div class="space-y-4">
                        <h3 class="font-display text-xl text-meme-pink italic uppercase flex items-center gap-2">
                            <i class="fas fa-plus-circle"></i> NEW SIGNALS
                        </h3>
                        <div id="newSignals" class="space-y-2">
                            <div class="p-4 bg-card/50 border border-card font-mono text-[10px] text-muted-text uppercase">Watching Mempool...</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    init: (container) => {
        const updateRadar = (tokens) => {
            if (!tokens || tokens.length === 0) return;

            // Liquidity Gems (Filter by verified or high volume)
            const gems = tokens.filter(t => t.verified).slice(0, 3);
            container.querySelector('#liquidityGems').innerHTML = gems.map(t => `
                <div class="p-3 bg-card border border-card flex justify-between items-center hover:border-meme-cyan transition-all">
                    <span class="font-display text-sm uppercase italic">${t.symbol}</span>
                    <span class="font-mono text-[10px] text-meme-cyan font-bold">${(t.price_change_24h * 100).toFixed(2)}%</span>
                </div>
            `).join('');

            // Volume Spikes (Mock logic)
            const spikes = [...tokens].sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 3);
            container.querySelector('#volumeSpikes').innerHTML = spikes.map(t => `
                <div class="p-3 bg-card border border-card flex justify-between items-center hover:border-meme-yellow transition-all">
                    <span class="font-display text-sm uppercase italic">${t.symbol}</span>
                    <span class="font-mono text-[10px] text-meme-yellow font-bold">${Math.round(t.volume_24h)} PAXI</span>
                </div>
            `).join('');

            // New Signals
            const news = tokens.slice(0, 3);
            container.querySelector('#newSignals').innerHTML = news.map(t => `
                <div class="p-3 bg-card border border-card flex justify-between items-center hover:border-meme-pink transition-all">
                    <span class="font-display text-sm uppercase italic">${t.symbol}</span>
                    <span class="font-mono text-[10px] text-muted-text">NEW</span>
                </div>
            `).join('');
        };

        State.subscribe('tokenList', updateRadar);
    }
};
