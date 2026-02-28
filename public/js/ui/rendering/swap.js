// ============================================
// SWAP.JS - Swap Terminal Rendering
// ============================================

window.renderSwapTerminal = async function() {
    let container = document.getElementById('mainSwapTerminal');
    const mainWrapper = document.getElementById('mainSwapContainer');

    if (!container) {
        container = document.getElementById('sidebarContent');
    }

    if (!container) return;

    // Visibility Rule: Swap terminal functionality only shows if wallet is connected (Phase 4 Revision)
    if (!window.wallet) {
        if (mainWrapper) {
            mainWrapper.classList.add('hidden');
        }

        if (container && container.id === 'sidebarContent') {
            container.innerHTML = `
                <div class="text-center py-20 bg-surface border-4 border-card shadow-brutal mx-4">
                    <i class="fas fa-wallet text-6xl mb-6 text-muted-text rotate-12"></i>
                    <p class="text-sm font-display uppercase italic text-muted-text tracking-tighter">Connect wallet to unlock terminal</p>
                </div>`;
        }
        return;
    } else if (mainWrapper) {
        mainWrapper.classList.remove('hidden');
    }

    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    const isBuy = window.tradeType === 'buy';
    const isWatchOnly = window.wallet?.isWatchOnly;

    // Render structure immediately
    const currentSlippage = window.slippage || 30.0;
    container.innerHTML = \`
        <div class="flex flex-col gap-4 animate-fade-in max-w-full overflow-hidden p-1">
            \${isWatchOnly ? \`
                <div class="p-3 bg-meme-yellow border-2 border-card shadow-brutal flex items-center gap-3 mb-2 rotate-[-1deg]">
                    <i class="fas fa-eye text-black text-sm animate-pulse"></i>
                    <div class="text-[10px] font-black text-black uppercase leading-tight italic">
                        Watch-only Mode: <span class="opacity-70">Balances view only.</span>
                    </div>
                </div>
            \` : ''}
            <div class="flex bg-surface p-1 border-2 border-card shadow-brutal rotate-[0.5deg]">
                <button onclick="window.setSwapMode('buy')" id="buyTab" class="flex-1 py-2 font-display text-xl transition-all \${isBuy ? 'bg-meme-green text-black italic' : 'text-muted-text italic hover:text-primary-text'}">BUY</button>
                <button onclick="window.setSwapMode('sell')" id="sellTab" class="flex-1 py-2 font-display text-xl transition-all \${!isBuy ? 'bg-meme-pink text-primary-text italic' : 'text-muted-text italic hover:text-primary-text'}">SELL</button>
            </div>
            <div class="space-y-4">
                <div class="bg-surface p-4 border-4 border-card shadow-brutal-sm rotate-[-0.5deg] group hover:rotate-0 transition-all">
                    <div class="flex justify-between text-[10px] text-muted-text mb-2 font-black uppercase italic tracking-widest">Pay <span onclick="window.setMaxPay()" class="cursor-pointer text-meme-cyan hover:underline flex items-center gap-1"><i class="fas fa-wallet opacity-50"></i> <span id="payBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-primary-text placeholder-gray-800 italic uppercase" oninput="window.updateTradeOutput()">
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-cyan font-display text-lg italic uppercase shadow-brutal-sm" id="payTokenSymbol">\${isBuy ? 'PAXI' : \`<span class="token-symbol-text">\${symbol}</span>\`}</div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="window.setPercentAmount(25)" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">25%</button>
                        <button onclick="window.setPercentAmount(50)" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">50%</button>
                        <button onclick="window.setPercentAmount(75)" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">75%</button>
                        <button onclick="window.setPercentAmount(100)" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">MAX</button>
                    </div>
                    <div class="mt-4"><input type="range" id="tradePercentSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-surface rounded-none appearance-none cursor-pointer accent-meme-green border border-gray-900" oninput="window.setPercentAmount(this.value)"></div>
                </div>

                <div class="flex justify-center -my-6 relative z-10"><button onclick="window.reverseTradePair()" class="w-10 h-10 bg-meme-cyan border-4 border-card shadow-brutal flex items-center justify-center hover:rotate-180 transition-all duration-500 group"><i class="fas fa-exchange-alt text-black text-lg group-hover:scale-110"></i></button></div>

                <div class="bg-surface p-4 border-4 border-card shadow-brutal-sm rotate-[0.5deg]">
                    <div class="flex justify-between text-[10px] text-muted-text mb-2 font-black uppercase italic tracking-widest">Receive <span id="recvBalContainer" class="flex items-center gap-1"><i class="fas fa-coins opacity-50"></i> <span id="recvBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-secondary-text italic uppercase" readonly>
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-yellow font-display text-lg italic uppercase shadow-brutal-sm" id="recvTokenSymbol">\${isBuy ? \`<span class="token-symbol-text">\${symbol}</span>\` : 'PAXI'}</div>
                    </div>
                </div>

                <div class="p-4 bg-surface border-4 border-card shadow-brutal-sm space-y-3 font-mono">
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Rate</span><span id="tradeRate" class="text-primary-text">1 PAXI = 0 <span class="token-symbol-text">\${symbol}</span></span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Min Recv</span><span id="minRecv" class="text-secondary-text">0.00 \${isBuy ? \`<span class="token-symbol-text">\${symbol}</span>\` : 'PAXI'}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Price Impact</span><span id="priceImpact" class="text-meme-green">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Variance</span><span id="actualSlippage" class="text-secondary-text">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic border-t border-gray-900 pt-3"><span class="text-muted-text">Tolerance</span><button onclick="window.showSlippageModal()" class="text-meme-cyan hover:underline flex items-center gap-1"><span id="slippageVal">\${currentSlippage.toFixed(1)}%</span> <i class="fas fa-cog text-[8px]"></i></button></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Network Fee</span><span id="networkFee" class="text-muted-text">~0.0063 PAXI</span></div>
                </div>

                <button onclick="\${isWatchOnly ? '' : 'window.executeTrade()'}"
                        \${isWatchOnly ? 'disabled' : ''}
                        class="w-full py-5 \${isBuy ? 'bg-meme-green shadow-brutal-green' : 'bg-meme-pink shadow-brutal-pink'} text-black border-4 border-card font-display text-3xl uppercase italic transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                    \${isWatchOnly ? 'WATCH-ONLY' : (isBuy ? 'BUY NOW' : 'SELL NOW')}
                </button>
            </div>
        </div>\`;

    // Fetch fresh pool data and update balances in background
    (async () => {
        if (window.fetchPoolData) await window.fetchPoolData();
        if (window.updateTradeBalances) await window.updateTradeBalances();
        if (window.updateTradeOutput) window.updateTradeOutput();
    })();
};