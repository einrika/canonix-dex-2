// ============================================
// MARKETGRID COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';
import { formatAmount, normalizeLogoUrl } from '../core/utils.js';

export const MarketGrid = {
    render: () => {
        return `
            <div id="market" class="space-y-12">
                <div class="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div class="space-y-4">
                        <h2 class="font-display text-4xl md:text-6xl italic uppercase tracking-tighter">Chain <span class="text-meme-green">Signals</span></h2>
                        <div class="flex flex-wrap gap-2">
                            ${['hot', 'new', 'marketcap', 'gainers', 'verified'].map(f => `
                                <button class="market-filter-btn px-4 py-1 border-2 border-card font-display text-sm uppercase italic transition-all shadow-brutal-sm hover:shadow-none bg-surface text-primary-text" data-filter="${f}">${f}</button>
                            `).join('')}
                        </div>
                    </div>
                    <div class="w-full md:w-80">
                        <div class="relative">
                            <input id="marketSearch" type="text" placeholder="Search Meme..." class="w-full bg-card border-4 border-card px-4 py-2 font-mono text-sm text-primary-text outline-none focus:border-meme-green/50 transition-all uppercase italic">
                            <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-muted-text/30"></i>
                        </div>
                    </div>
                </div>

                <div id="marketGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <!-- Dynamic Tokens -->
                </div>

                <div id="loadMoreContainer" class="flex justify-center pt-12">
                    <button id="loadMoreMarket" class="px-12 py-4 bg-surface border-4 border-card font-display text-2xl italic uppercase shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">Load More Signals</button>
                </div>
            </div>
        `;
    },
    init: (container) => {
        const grid = container.querySelector('#marketGrid');

        const renderTokens = (tokens) => {
            if (!tokens || tokens.length === 0) {
                grid.innerHTML = '<div class="col-span-full text-center py-20 text-muted-text font-display text-2xl uppercase italic">No signals found in the noise</div>';
                return;
            }

            grid.innerHTML = tokens.map(t => {
                const change = (t.price_change_24h * 100).toFixed(2);
                const colorClass = t.price_change_24h >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-primary-text';
                const logo = normalizeLogoUrl(t.logo);

                return `
                    <a href="trade.html?token=${t.address}" class="bg-surface border-4 border-card p-6 shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group block relative overflow-hidden">
                        <div class="flex items-center gap-4 mb-8">
                            <div class="w-12 h-12 bg-surface border-2 border-card flex items-center justify-center text-xl font-display text-primary-text group-hover:rotate-6 transition-transform shadow-brutal-sm">
                                <img src="${logo}" class="w-full h-full object-cover" onerror="this.style.display='none'">
                                <span>${t.symbol.charAt(0)}</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="font-display text-2xl text-primary-text tracking-tighter uppercase italic truncate">${t.symbol}</span>
                                    ${t.verified ? '<i class="fas fa-check-circle text-meme-cyan text-xs"></i>' : ''}
                                </div>
                                <div class="text-[8px] text-meme-cyan font-mono font-bold uppercase tracking-widest">PRC-20 ASSET</div>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <div>
                                <div class="text-[8px] text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 italic">Price</div>
                                <div class="text-2xl font-display text-primary-text italic tracking-tight">${t.price_paxi.toFixed(8)} <span class="text-meme-yellow text-xs">PAXI</span></div>
                            </div>

                            <div class="flex justify-between items-center pt-4 border-t-2 border-card">
                                <div class="px-3 py-1 border-2 border-card font-display text-base ${colorClass}">
                                    ${t.price_change_24h >= 0 ? '+' : ''}${change}%
                                </div>
                                <div class="text-right">
                                    <div class="text-[8px] text-muted-text font-mono font-bold uppercase tracking-widest italic">Volume</div>
                                    <div class="text-base font-display text-meme-cyan italic tracking-tight">${formatAmount(t.volume_24h)}</div>
                                </div>
                            </div>
                        </div>
                    </a>
                `;
            }).join('');
        };

        State.subscribe('tokenList', renderTokens);

        container.querySelectorAll('.market-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                State.set('marketFilter', filter);
                container.querySelectorAll('.market-filter-btn').forEach(b => b.classList.replace('bg-meme-green', 'bg-surface'));
                btn.classList.replace('bg-surface', 'bg-meme-green');
            });
        });
    }
};
