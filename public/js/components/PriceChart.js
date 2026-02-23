// ============================================
// PRICECHART COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';
import { formatPrice } from '../core/utils.js';

export const PriceChart = {
    render: () => {
        return `
            <div id="chartContainer" class="flex-1 min-h-[300px] flex flex-col bg-surface overflow-hidden relative">
                <!-- Chart Header -->
                <div class="flex items-center justify-between px-3 py-2 bg-secondary/50 border-b border-card backdrop-blur-md">
                    <div class="flex items-center gap-4">
                        <div class="flex flex-col">
                            <div class="flex items-center gap-2">
                                <span id="pairName" class="font-display text-base text-primary-text italic">TOKEN/PAXI</span>
                                <span id="priceChange" class="text-[9px] font-bold text-up">+0.00%</span>
                            </div>
                            <span id="currentPrice" class="font-mono text-xs text-accent font-black tracking-tighter">0.00000000 PAXI</span>
                        </div>
                    </div>

                    <div id="chart-controls" class="flex items-center gap-1">
                        ${['realtime', '1h', '24h', '7d'].map(tf => `
                            <button class="tf-btn px-2 py-1 bg-card border border-card text-[8px] font-mono font-bold text-muted-text hover:text-accent transition-all uppercase" data-tf="${tf}">${tf}</button>
                        `).join('')}
                    </div>
                </div>

                <!-- Main Chart Wrapper -->
                <div id="chartWrapper" class="flex-1 relative">
                    <div id="priceChart" class="absolute inset-0"></div>
                    <div id="chartStatus" class="absolute top-2 left-2 px-2 py-0.5 bg-black/40 backdrop-blur-md border border-white/5 text-[7px] font-mono text-muted-text uppercase tracking-widest z-10">Initializing...</div>
                </div>

                <!-- Chart Overlay for indicators -->
                <div class="flex items-center gap-3 px-3 py-1.5 border-t border-card bg-secondary/30">
                    <button id="toggleMA7" class="px-2 py-0.5 bg-card border border-card text-[7px] font-mono font-bold text-muted-text hover:text-white transition-all uppercase italic">MA7</button>
                    <button id="toggleMA25" class="px-2 py-0.5 bg-card border border-card text-[7px] font-mono font-bold text-muted-text hover:text-white transition-all uppercase italic">MA25</button>
                </div>
            </div>
        `;
    },
    init: (container) => {
        // Initialize Lightweight Charts here
        console.log('PriceChart initialized');

        container.querySelectorAll('.tf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tf = btn.dataset.tf;
                State.set('chartTimeframe', tf);
                // Load history logic here
            });
        });

        State.subscribe('currentToken', (token) => {
            if (token) {
                container.querySelector('#pairName').textContent = `${token.symbol}/PAXI`;
            }
        });

        State.subscribe('paxiPriceUSD', (price) => {
            // Update prices if needed
        });
    }
};
