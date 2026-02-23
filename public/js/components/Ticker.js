// ============================================
// TICKER COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';

export const Ticker = {
    render: () => {
        return `
            <div id="ticker" class="h-6 bg-card border-b border-card flex items-center overflow-hidden whitespace-nowrap">
                <div id="tickerTrack" class="flex gap-12 animate-marquee items-center">
                    <!-- Ticker items -->
                </div>
            </div>
        `;
    },
    init: (container) => {
        const track = container.querySelector('#tickerTrack');

        const renderItems = (tokens) => {
            if (!tokens || tokens.length === 0) return;

            const items = tokens.slice(0, 10).map(t => `
                <div class="flex items-center gap-2">
                    <span class="font-display text-[10px] italic uppercase text-primary-text">${t.symbol}</span>
                    <span class="text-[8px] font-mono ${t.price_change_24h >= 0 ? 'text-up' : 'text-down'}">${t.price_change_24h >= 0 ? '+' : ''}${(t.price_change_24h * 100).toFixed(2)}%</span>
                </div>
            `).join('');

            // Duplicate for smooth loop
            track.innerHTML = items + items;
        };

        State.subscribe('tokenList', renderItems);
    }
};
