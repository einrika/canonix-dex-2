// ============================================
// MARKET RADAR LOGIC
// ============================================

import { State } from '../core/state.js';
import { LandingPage } from '../pages/landing.js';
import { formatAmount, normalizeLogoUrl } from '../core/utils.js';

export const MarketRadarLogic = (container) => {
    const listContainer = container.querySelector('#market-list');
    const loadMoreBtn = container.querySelector('#loadMoreMarket');
    const filterBtns = container.querySelectorAll('.radar-filter-btn');

    const renderList = (tokens) => {
        if (!listContainer) return;
        if (!tokens || tokens.length === 0) {
            listContainer.innerHTML = '<div class="col-span-full py-20 text-center text-gray-700 font-display text-2xl uppercase italic opacity-20"><i class="fas fa-satellite-dish text-6xl mb-6"></i><p>Zero Activity Detected</p></div>';
            return;
        }

        listContainer.innerHTML = tokens.map(t => {
            const change = (t.price_change_24h * 100).toFixed(2);
            const colorClass = t.price_change_24h >= 0 ? 'bg-meme-green text-black' : 'bg-meme-pink text-white';
            const logoUrl = normalizeLogoUrl(t.logo);
            const vol = formatAmount(t.volume_24h);

            return `
                <a href="trade.html?token=${t.address}" class="group bg-meme-card border-2 md:border-4 border-black p-4 md:p-8 hover:bg-meme-surface transition-all shadow-[4px_4px_0_0_#000] md:shadow-brutal hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] hover:shadow-none relative overflow-hidden">
                    <div class="absolute top-0 right-0 w-24 h-24 bg-meme-cyan opacity-[0.03] rotate-45 translate-x-12 -translate-y-12"></div>
                    <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                        <div class="relative flex-shrink-0">
                            ${logoUrl ?
                                `<img src="${logoUrl}" class="w-10 h-10 md:w-12 md:h-12 border-2 border-black group-hover:rotate-6 transition-transform shadow-brutal-sm object-cover" onerror="this.classList.add('hidden'); this.nextElementSibling.classList.remove('hidden');">
                                 <div class="hidden w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-black flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>` :
                                `<div class="w-10 h-10 md:w-12 md:h-12 bg-meme-yellow border-2 border-black flex items-center justify-center text-lg font-display text-black shadow-brutal-sm">${t.symbol.charAt(0)}</div>`
                            }
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="font-display text-lg md:text-2xl text-white tracking-tighter uppercase italic truncate block">${t.symbol}</span>
                            <div class="text-[8px] md:text-[10px] text-meme-cyan font-mono font-bold uppercase tracking-widest">PRC-20 ASSET</div>
                        </div>
                    </div>
                    <div class="space-y-3 relative z-10">
                        <div class="text-lg md:text-2xl font-display text-white italic tracking-tight truncate">${t.price_paxi.toFixed(8)} <span class="text-meme-yellow text-xs">PAXI</span></div>
                        <div class="flex justify-between items-center pt-3 border-t-2 border-black">
                            <div class="px-2 py-0.5 border-2 border-black font-display text-[10px] md:text-base ${colorClass}">${t.price_change_24h >= 0 ? '+' : ''}${change}%</div>
                            <div class="text-right">
                                <div class="text-[7px] text-gray-600 font-mono font-bold uppercase">Volume</div>
                                <div class="text-[10px] font-display text-meme-cyan italic">${vol}</div>
                            </div>
                        </div>
                    </div>
                </a>
            `;
        }).join('');

        if (loadMoreBtn) {
            const hasMore = LandingPage.state.marketTotalAvailable > LandingPage.state.marketTokens.length;
            loadMoreBtn.classList.toggle('hidden', !hasMore);
        }
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('bg-meme-cyan', 'text-black'));
            btn.classList.add('bg-meme-cyan', 'text-black');
            LandingPage.state.marketFilter = btn.dataset.filter;
            LandingPage.state.marketPage = 0;
            LandingPage.state.marketTokens = [];
            LandingPage.loadMarket();
        });
    });

    loadMoreBtn?.addEventListener('click', () => {
        LandingPage.state.marketPage++;
        LandingPage.loadMarket();
    });

    State.subscribe('marketTokens', (tokens) => renderList(tokens));

    // Initial load handled by LandingPage.init()
};
