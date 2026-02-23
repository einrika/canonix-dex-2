// ============================================
// SWAPTERMINAL LOGIC
// ============================================

window.tradeType = 'buy';
window.feeEnabled = false;
window.slippage = 30.0;
window.gasUpdateTimeout = null;

window.UIManager.registerLogic('SwapTerminal', (container) => {
    // Initial render
    if (window.renderSwapTerminal) window.renderSwapTerminal();
});

window.renderSwapTerminal = async function() {
    let container = document.getElementById('mainSwapTerminal');
    const mainWrapper = document.getElementById('mainSwapContainer');
    if (!container) container = document.getElementById('sidebarContent');
    if (!container) return;

    if (!window.wallet) {
        if (mainWrapper) mainWrapper.classList.add('hidden');
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
    const currentSlippage = window.slippage || 30.0;

    container.innerHTML = `
        <div class="flex flex-col gap-4 animate-fade-in max-w-full overflow-hidden p-1">
            ${isWatchOnly ? `
                <div class="p-3 bg-meme-yellow border-2 border-card shadow-brutal flex items-center gap-3 mb-2 rotate-[-1deg]">
                    <i class="fas fa-eye text-black text-sm animate-pulse"></i>
                    <div class="text-[10px] font-black text-black uppercase leading-tight italic">
                        Watch-only Mode: <span class="opacity-70">Balances view only.</span>
                    </div>
                </div>
            ` : ''}
            <div class="flex bg-surface p-1 border-2 border-card shadow-brutal rotate-[0.5deg]">
                <button id="buyTab" class="flex-1 py-2 font-display text-xl transition-all ${isBuy ? 'bg-meme-green text-black italic' : 'text-muted-text italic hover:text-primary-text'}">BUY</button>
                <button id="sellTab" class="flex-1 py-2 font-display text-xl transition-all ${!isBuy ? 'bg-meme-pink text-primary-text italic' : 'text-muted-text italic hover:text-primary-text'}">SELL</button>
            </div>
            <div class="space-y-4">
                <div class="bg-surface p-4 border-4 border-card shadow-brutal-sm rotate-[-0.5deg] group hover:rotate-0 transition-all">
                    <div class="flex justify-between text-[10px] text-muted-text mb-2 font-black uppercase italic tracking-widest">Pay <span id="max-pay-btn" class="cursor-pointer text-meme-cyan hover:underline flex items-center gap-1"><i class="fas fa-wallet opacity-50"></i> <span id="payBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-primary-text placeholder-gray-800 italic uppercase">
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-cyan font-display text-lg italic uppercase shadow-brutal-sm" id="payTokenSymbol">${isBuy ? 'PAXI' : symbol}</div>
                    </div>
                    <div class="flex gap-2 mt-4" id="percent-btns">
                        <button data-pct="25" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">25%</button>
                        <button data-pct="50" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">50%</button>
                        <button data-pct="75" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">75%</button>
                        <button data-pct="100" class="flex-1 py-1.5 bg-surface border-2 border-card font-display text-sm text-secondary-text hover:text-primary-text hover:border-meme-pink transition-all italic uppercase">MAX</button>
                    </div>
                    <div class="mt-4"><input type="range" id="tradePercentSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-surface rounded-none appearance-none cursor-pointer accent-meme-green border border-gray-900"></div>
                </div>
                <div class="flex justify-center -my-6 relative z-10"><button id="reverse-pair-btn" class="w-10 h-10 bg-meme-cyan border-4 border-card shadow-brutal flex items-center justify-center hover:rotate-180 transition-all duration-500 group"><i class="fas fa-exchange-alt text-black text-lg group-hover:scale-110"></i></button></div>
                <div class="bg-surface p-4 border-4 border-card shadow-brutal-sm rotate-[0.5deg]">
                    <div class="flex justify-between text-[10px] text-muted-text mb-2 font-black uppercase italic tracking-widest">Receive <span id="recvBalContainer" class="flex items-center gap-1"><i class="fas fa-coins opacity-50"></i> <span id="recvBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-secondary-text italic uppercase" readonly>
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-yellow font-display text-lg italic uppercase shadow-brutal-sm" id="recvTokenSymbol">${isBuy ? symbol : 'PAXI'}</div>
                    </div>
                </div>
                <div class="p-4 bg-surface border-4 border-card shadow-brutal-sm space-y-3 font-mono">
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Rate</span><span id="tradeRate" class="text-primary-text">1 PAXI = 0 ${symbol}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Min Recv</span><span id="minRecv" class="text-secondary-text">0.00 ${isBuy ? symbol : 'PAXI'}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Price Impact</span><span id="priceImpact" class="text-meme-green">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Variance</span><span id="actualSlippage" class="text-secondary-text">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic border-t border-gray-900 pt-3"><span class="text-muted-text">Tolerance</span><button id="show-slippage-btn" class="text-meme-cyan hover:underline flex items-center gap-1"><span id="slippageVal">${currentSlippage.toFixed(1)}%</span> <i class="fas fa-cog text-[8px]"></i></button></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Network Fee</span><span id="networkFee" class="text-muted-text">~0.0063 PAXI</span></div>
                </div>
                <button id="execute-swap-btn" ${isWatchOnly ? 'disabled' : ''} class="w-full py-5 ${isBuy ? 'bg-meme-green shadow-brutal-green' : 'bg-meme-pink shadow-brutal-pink'} text-black border-4 border-card font-display text-3xl uppercase italic transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                    ${isWatchOnly ? 'WATCH-ONLY' : (isBuy ? 'BUY NOW' : 'SELL NOW')}
                </button>
            </div>
        </div>`;

    container.querySelector('#buyTab')?.addEventListener('click', () => window.setSwapMode('buy'));
    container.querySelector('#sellTab')?.addEventListener('click', () => window.setSwapMode('sell'));
    container.querySelector('#max-pay-btn')?.addEventListener('click', () => window.setMaxPay());
    container.querySelector('#tradePayAmount')?.addEventListener('input', () => window.updateTradeOutput());
    container.querySelectorAll('#percent-btns button').forEach(btn => {
        btn.addEventListener('click', () => window.setPercentAmount(btn.dataset.pct));
    });
    container.querySelector('#tradePercentSlider')?.addEventListener('input', (e) => window.setPercentAmount(e.target.value));
    container.querySelector('#reverse-pair-btn')?.addEventListener('click', () => window.reverseTradePair());
    container.querySelector('#show-slippage-btn')?.addEventListener('click', () => window.showSlippageModal());
    container.querySelector('#execute-swap-btn')?.addEventListener('click', () => { if (!isWatchOnly) window.executeTrade(); });

    (async () => {
        if (window.fetchPoolData) await window.fetchPoolData();
        if (window.updateTradeBalances) await window.updateTradeBalances();
        if (window.updateTradeOutput) window.updateTradeOutput();
    })();
};

window.setSwapMode = function(mode) {
    window.tradeType = mode;
    window.renderSwapTerminal();
};

window.reverseTradePair = function() {
    window.tradeType = window.tradeType === 'buy' ? 'sell' : 'buy';
    window.renderSwapTerminal();
};

window.setPercentAmount = function(val) {
    const balEl = document.getElementById('payBalance');
    const rawBal = balEl?.getAttribute('data-raw');
    const balance = parseFloat(balEl?.textContent || '0');
    const percent = parseFloat(val) / 100;
    let amountStr = '';
    const paySymbol = document.getElementById('payTokenSymbol')?.textContent;
    if (rawBal && val === "100") {
        let rawBig = BigInt(rawBal);
        const decimals = (window.tradeType === 'buy' || paySymbol === 'PAXI') ? 6 : (window.currentTokenInfo?.decimals || 6);
        if (window.tradeType === 'buy' || paySymbol === 'PAXI') {
            const gasReserve = BigInt(100000);
            if (rawBig > gasReserve) rawBig -= gasReserve; else rawBig = 0n;
        }
        const s = rawBig.toString().padStart(decimals + 1, '0');
        amountStr = s.slice(0, -decimals) + '.' + s.slice(-decimals);
        amountStr = amountStr.replace(/\.?0+$/, '');
        if (amountStr.startsWith('.')) amountStr = '0' + amountStr;
    } else {
        let amount = balance * percent;
        if ((window.tradeType === 'buy' || paySymbol === 'PAXI') && percent > 0.9) amount = Math.max(0, amount - 0.1);
        amountStr = amount > 0 ? amount.toFixed(6) : '';
    }
    window.setValue('tradePayAmount', amountStr);
    const slider = document.getElementById('tradePercentSlider');
    if (slider) slider.value = val;
    window.updateTradeOutput();
};

window.setMaxPay = function() { window.setPercentAmount(100); };

window.setSlippage = function(val) {
    window.slippage = val;
    window.setValue('customSlippage', val);
    window.setText('slippageVal', val.toFixed(1) + '%');
    window.updateTradeOutput();
};

window.updateCustomSlippage = function() {
    let val = parseFloat(document.getElementById('customSlippage')?.value);
    if (!isNaN(val) && val > 0) {
        if (val > 30) { val = 30; window.setValue('customSlippage', 30); }
        window.slippage = val;
        window.setText('slippageVal', val.toFixed(1) + '%');
        window.updateTradeOutput();
    }
};

window.updateTradeOutput = async function() {
    const payAmount = parseFloat(document.getElementById('tradePayAmount')?.value) || 0;
    if (!window.poolData || payAmount <= 0 || !window.currentPRC20) {
        window.setValue('tradeRecvAmount', ''); window.setText('minRecv', '0.00');
        window.setText('priceImpact', '-'); window.setText('networkFee', '0.00 PAXI'); return;
    }
    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const reservePaxi = parseFloat(window.poolData.reserve_paxi);
    const reservePrc20 = parseFloat(window.poolData.reserve_prc20);
    let outputAmount, priceImpact, targetDecimals;
    if (window.tradeType === 'buy') {
        const fromAmountBase = payAmount * 1e6; const fee = fromAmountBase * 0.003; const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePrc20) / (reservePaxi + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePaxi + amountAfterFee)) * 100;
        targetDecimals = tokenDecimals;
    } else {
        const fromAmountBase = payAmount * Math.pow(10, tokenDecimals); const fee = fromAmountBase * 0.003; const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePrc20 + amountAfterFee)) * 100;
        targetDecimals = 6;
    }
    const outputDisplay = (outputAmount / Math.pow(10, targetDecimals)).toFixed(6);
    window.setValue('tradeRecvAmount', outputDisplay);
    const impactEl = document.getElementById('priceImpact');
    if (impactEl) {
        window.setText(impactEl, priceImpact.toFixed(2) + '%');
        impactEl.className = priceImpact > 5 ? 'font-mono text-down' : priceImpact > 2 ? 'font-mono text-yellow-400' : 'font-mono text-up';
    }
    const actualSlippageEl = document.getElementById('actualSlippage');
    if (actualSlippageEl) window.setText(actualSlippageEl, priceImpact.toFixed(2) + '%');
    const minRecv = (outputAmount * (1 - (window.slippage / 100)) / Math.pow(10, targetDecimals)).toFixed(6);
    const recvSymbol = window.tradeType === 'buy' ? (window.currentTokenInfo?.symbol || 'TOKEN') : 'PAXI';
    window.setText('minRecv', `${minRecv} ${recvSymbol}`);
    const swapBtn = document.querySelector('#execute-swap-btn');
    if (swapBtn && !window.wallet?.isWatchOnly) {
        const rawBal = document.getElementById('payBalance')?.getAttribute('data-raw') || "0";
        const balanceRaw = BigInt(rawBal);
        const amountToPayRaw = BigInt(window.toMicroAmount(payAmount, window.tradeType === 'buy' ? 6 : tokenDecimals));
        if (amountToPayRaw > balanceRaw) { swapBtn.disabled = true; swapBtn.textContent = "INSUFFICIENT BALANCE"; }
        else { swapBtn.disabled = false; swapBtn.textContent = window.tradeType === 'buy' ? "BUY NOW" : "SELL NOW"; }
    }
    const rate = window.tradeType === 'buy' ? (outputAmount / (payAmount * 1e6) * Math.pow(10, 6 - tokenDecimals)).toFixed(4) : (payAmount / (outputAmount / 1e6)).toFixed(4);
    window.setText('tradeRate', `1 PAXI = ${rate} ${window.currentTokenInfo?.symbol || 'TOKEN'}`);
    if (window.gasUpdateTimeout) clearTimeout(window.gasUpdateTimeout);
    window.gasUpdateTimeout = setTimeout(async () => {
        try {
            const gasInfo = await window.fetchGasEstimate(1);
            if (gasInfo) window.setText('networkFee', `${parseFloat(gasInfo.estimatedFee).toFixed(4)} PAXI (~$${gasInfo.usdValue})`);
        } catch (e) { window.setText('networkFee', 'Error'); }
    }, 1000);
};

window.executeTrade = async function() {
    if (!window.wallet) { window.showConnectModal(); return; }
    if (!window.currentPRC20) return;
    const payAmount = parseFloat(document.getElementById('tradePayAmount')?.value);
    if (!payAmount || payAmount <= 0) return;
    window.updateTradeOutput();
    const minReceivedStr = document.getElementById('minRecv').textContent.split(' ')[0];
    const minReceived = parseFloat(minReceivedStr) || 0;
    const offerDenom = window.tradeType === 'buy' ? window.APP_CONFIG.DENOM : window.currentPRC20;
    try { await window.executeSwap(window.currentPRC20, offerDenom, payAmount, minReceived); } catch (e) { console.error(e); }
};
