// ============================================
// SWAPTERMINAL COMPONENT (ES Module)
// ============================================

import { State } from '../core/state.js';
import { formatAmount, formatPrice } from '../core/utils.js';

export const SwapTerminal = {
    render: () => {
        return `
            <div id="swapTerminal" class="p-3 bg-surface border-b border-card">
                <div class="flex items-center justify-between mb-3 px-1">
                    <div class="flex gap-2">
                        <button id="buyModeBtn" class="px-4 py-1.5 font-display text-xs italic border-2 border-card bg-meme-green text-black shadow-brutal-sm uppercase">Buy</button>
                        <button id="sellModeBtn" class="px-4 py-1.5 font-display text-xs italic border-2 border-card bg-surface text-primary-text hover:bg-meme-pink/20 transition-all uppercase">Sell</button>
                    </div>
                    <button id="settingsBtn" class="text-muted-text hover:text-meme-cyan"><i class="fas fa-sliders-h text-xs"></i></button>
                </div>

                <div class="space-y-2">
                    <!-- Pay Input -->
                    <div class="p-3 bg-card border-2 border-transparent focus-within:border-meme-cyan/30 transition-all">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[8px] font-mono text-muted-text uppercase font-bold italic">You Pay</span>
                            <span id="userBalance" class="text-[8px] font-mono text-muted-text font-bold">Balance: 0.00</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <input id="swapInput" type="number" placeholder="0.00" class="w-full bg-transparent text-xl font-display text-primary-text outline-none placeholder:text-muted-text/30 italic">
                            <div class="flex items-center gap-1.5 px-2 py-1 bg-surface border border-card rounded shadow-sm">
                                <span id="payTokenSymbol" class="text-[10px] font-display text-primary-text italic">PAXI</span>
                            </div>
                        </div>
                    </div>

                    <!-- Percent Slider -->
                    <div class="flex justify-between items-center gap-2 px-1 py-1">
                        ${[25, 50, 75, 100].map(p => `
                            <button class="percent-btn flex-1 py-1 bg-card border border-card text-[9px] font-mono font-bold text-muted-text hover:bg-meme-cyan/20 hover:text-meme-cyan transition-all uppercase italic" data-pct="${p}">${p === 100 ? 'Max' : p + '%'}</button>
                        `).join('')}
                    </div>

                    <!-- Switch Icon -->
                    <div class="flex justify-center -my-2 relative z-10">
                        <button id="switchTokens" class="w-7 h-7 bg-surface border-2 border-card shadow-brutal-sm flex items-center justify-center text-accent hover:rotate-180 transition-transform">
                            <i class="fas fa-arrow-down text-[10px]"></i>
                        </button>
                    </div>

                    <!-- Receive Input -->
                    <div class="p-3 bg-card border-2 border-transparent">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-[8px] font-mono text-muted-text uppercase font-bold italic">You Receive (Est)</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <input id="swapOutput" type="text" placeholder="0.00" class="w-full bg-transparent text-xl font-display text-meme-cyan outline-none placeholder:text-muted-text/30 italic" readonly>
                            <div class="flex items-center gap-1.5 px-2 py-1 bg-surface border border-card rounded shadow-sm">
                                <span id="recvTokenSymbol" class="text-[10px] font-display text-primary-text italic">TOKEN</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Info Lines -->
                <div class="mt-4 space-y-1.5 px-1">
                    <div class="flex justify-between items-center">
                        <span class="text-[8px] font-mono text-muted-text uppercase font-bold">Price Impact</span>
                        <span id="priceImpact" class="text-[8px] font-mono text-soft-success font-bold">0.00%</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-[8px] font-mono text-muted-text uppercase font-bold">Min. Received</span>
                        <span id="minReceived" class="text-[8px] font-mono text-primary-text font-bold">0.00</span>
                    </div>
                </div>

                <!-- Action Button -->
                <button id="swapActionBtn" class="w-full mt-4 py-3 bg-meme-green text-black font-display text-xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic tracking-tight">Connect Wallet</button>
            </div>
        `;
    },
    init: (container) => {
        let isBuy = true;

        const updateUI = () => {
            const currentToken = State.get('currentToken');
            const wallet = State.get('wallet');

            container.querySelector('#payTokenSymbol').textContent = isBuy ? 'PAXI' : (currentToken?.symbol || 'TOKEN');
            container.querySelector('#recvTokenSymbol').textContent = isBuy ? (currentToken?.symbol || 'TOKEN') : 'PAXI';

            const actionBtn = container.querySelector('#swapActionBtn');
            if (!wallet) {
                actionBtn.textContent = 'Connect Wallet';
                actionBtn.className = 'w-full mt-4 py-3 bg-accent text-black font-display text-xl border-4 border-card shadow-brutal uppercase italic';
            } else {
                actionBtn.textContent = isBuy ? 'Execute Buy' : 'Execute Sell';
                actionBtn.className = `w-full mt-4 py-3 ${isBuy ? 'bg-meme-green' : 'bg-meme-pink'} text-black font-display text-xl border-4 border-card shadow-brutal uppercase italic`;
            }
        };

        container.querySelector('#buyModeBtn').addEventListener('click', (e) => {
            isBuy = true;
            e.target.classList.add('bg-meme-green', 'text-black');
            container.querySelector('#sellModeBtn').classList.remove('bg-meme-pink', 'text-black');
            container.querySelector('#sellModeBtn').classList.add('bg-surface', 'text-primary-text');
            updateUI();
        });

        container.querySelector('#sellModeBtn').addEventListener('click', (e) => {
            isBuy = false;
            e.target.classList.add('bg-meme-pink', 'text-black');
            container.querySelector('#buyModeBtn').classList.remove('bg-meme-green', 'text-black');
            container.querySelector('#buyModeBtn').classList.add('bg-surface', 'text-primary-text');
            updateUI();
        });

        container.querySelector('#swapActionBtn').addEventListener('click', () => {
            if (!State.get('wallet')) {
                window.showConnectModal?.();
            } else {
                // Execute swap logic
                console.log('Swap executing...');
            }
        });

        State.subscribe('wallet', updateUI);
        State.subscribe('currentToken', updateUI);
    }
};
