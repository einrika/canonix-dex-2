// ============================================
// SWAP.JS - Token Swap Operations
// ============================================

// ===== GLOBAL SWAP STATE =====
window.tradeType = 'buy'; // buy or sell
window.feeEnabled = false; // Platform fee disabled
window.slippage = 30.0;


// ===== RENDER SWAP TERMINAL (MAIN CONTENT or SIDEBAR) =====
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
                <button onclick="window.setSwapMode('buy')" id="buyTab" class="flex-1 py-2 font-display text-xl transition-all ${isBuy ? 'bg-meme-green text-black italic' : 'text-muted-text italic hover:text-primary-text'}">BUY</button>
                <button onclick="window.setSwapMode('sell')" id="sellTab" class="flex-1 py-2 font-display text-xl transition-all ${!isBuy ? 'bg-meme-pink text-primary-text italic' : 'text-muted-text italic hover:text-primary-text'}">SELL</button>
            </div>
            <div class="space-y-4">
                <div class="bg-surface p-4 border-4 border-card shadow-brutal-sm rotate-[-0.5deg] group hover:rotate-0 transition-all">
                    <div class="flex justify-between text-[10px] text-muted-text mb-2 font-black uppercase italic tracking-widest">Pay <span onclick="window.setMaxPay()" class="cursor-pointer text-meme-cyan hover:underline flex items-center gap-1"><i class="fas fa-wallet opacity-50"></i> <span id="payBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-primary-text placeholder-gray-800 italic uppercase" oninput="window.updateTradeOutput()">
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-cyan font-display text-lg italic uppercase shadow-brutal-sm" id="payTokenSymbol">${isBuy ? 'PAXI' : `<span class="token-symbol-text">${symbol}</span>`}</div>
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
                        <div class="px-3 py-1 bg-surface border-2 border-card text-meme-yellow font-display text-lg italic uppercase shadow-brutal-sm" id="recvTokenSymbol">${isBuy ? `<span class="token-symbol-text">${symbol}</span>` : 'PAXI'}</div>
                    </div>
                </div>

                <div class="p-4 bg-surface border-4 border-card shadow-brutal-sm space-y-3 font-mono">
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Rate</span><span id="tradeRate" class="text-primary-text">1 PAXI = 0 <span class="token-symbol-text">${symbol}</span></span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Min Recv</span><span id="minRecv" class="text-secondary-text">0.00 ${isBuy ? `<span class="token-symbol-text">${symbol}</span>` : 'PAXI'}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Price Impact</span><span id="priceImpact" class="text-meme-green">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Variance</span><span id="actualSlippage" class="text-secondary-text">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic border-t border-gray-900 pt-3"><span class="text-muted-text">Tolerance</span><button onclick="window.showSlippageModal()" class="text-meme-cyan hover:underline flex items-center gap-1"><span id="slippageVal">${currentSlippage.toFixed(1)}%</span> <i class="fas fa-cog text-[8px]"></i></button></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-muted-text">Est.Fee</span><span id="networkFee" class="text-muted-text">~0.0035 PAXI</span></div>
                </div>

                <button onclick="${isWatchOnly ? '' : 'window.executeTrade()'}"
                        ${isWatchOnly ? 'disabled' : ''}
                        class="w-full py-5 ${isBuy ? 'bg-meme-green shadow-brutal-green' : 'bg-meme-pink shadow-brutal-pink'} text-black border-4 border-card font-display text-3xl uppercase italic transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                    ${isWatchOnly ? 'WATCH-ONLY' : (isBuy ? 'BUY NOW' : 'SELL NOW')}
                </button>
            </div>
        </div>`;
    
    // Fetch fresh pool data and update balances in background
    (async () => {
        if (window.fetchPoolData) await window.fetchPoolData();
        if (window.updateTradeBalances) await window.updateTradeBalances();
        if (window.updateTradeOutput) window.updateTradeOutput();
    })();
};

// ===== SET SWAP MODE (Buy vs Sell) =====
window.setSwapMode = function(mode) {
    window.tradeType = mode;
    
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');
    
    if (!buyTab || !sellTab) return;
    
    buyTab.classList.remove('bg-meme-green', 'bg-meme-pink', 'text-bg', 'text-secondary-text');
    sellTab.classList.remove('bg-meme-green', 'bg-meme-pink', 'text-bg', 'text-secondary-text');
    
    if (mode === 'buy') {
        buyTab.classList.add('bg-meme-green', 'text-bg');
        sellTab.classList.add('text-secondary-text');
        
        window.setText('payTokenSymbol', 'PAXI');
        window.setText('recvTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
    } else {
        sellTab.classList.add('bg-meme-pink', 'text-bg');
        buyTab.classList.add('text-secondary-text');
        
        window.setText('payTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
        window.setText('recvTokenSymbol', 'PAXI');
    }
    
    window.updateTradeOutput();
    if (window.updateTradeBalances) window.updateTradeBalances();
};

// ===== REVERSE TRADE PAIR =====
window.reverseTradePair = function() {
    const newMode = window.tradeType === 'buy' ? 'sell' : 'buy';
    window.setSwapMode(newMode);
};

// ===== SET PERCENT AMOUNT =====
window.setPercentAmount = function(val) {
    const balEl = document.getElementById('payBalance');
    const rawBal = balEl?.getAttribute('data-raw');
    const balance = parseFloat(balEl?.textContent || '0');
    const percent = parseFloat(val) / 100;
    
    let amountStr = '';
    const paySymbol = document.getElementById('payTokenSymbol')?.textContent;
    
    if (rawBal && val === "100") {
        // Use BigInt for MAX to avoid precision loss
        let rawBig = BigInt(rawBal);
        const decimals = (window.tradeType === 'buy' || paySymbol === 'PAXI') ? 6 : (window.currentTokenInfo?.decimals || 6);
        
        if (window.tradeType === 'buy' || paySymbol === 'PAXI') {
            const gasReserve = BigInt(100000); // 0.1 PAXI
            if (rawBig > gasReserve) rawBig -= gasReserve;
            else rawBig = 0n;
        }
        
        // Convert raw back to human for the input field
        const s = rawBig.toString().padStart(decimals + 1, '0');
        amountStr = s.slice(0, -decimals) + '.' + s.slice(-decimals);
        amountStr = amountStr.replace(/\.?0+$/, '');
        if (amountStr.startsWith('.')) amountStr = '0' + amountStr;
    } else {
        let amount = balance * percent;
        if ((window.tradeType === 'buy' || paySymbol === 'PAXI') && percent > 0.9) {
            amount = Math.max(0, amount - 0.1);
        }
        amountStr = amount > 0 ? amount.toFixed(6) : '';
    }
    
    window.setValue('tradePayAmount', amountStr);
    
    // Sync slider if called from button
    const slider = document.getElementById('tradePercentSlider');
    if (slider && slider.value !== val.toString()) {
        slider.value = val;
    }
    
    window.updateTradeOutput();
};

// ===== SET MAX PAY =====
window.setMaxPay = function() {
    window.setPercentAmount(100);
};

// ===== SLIPPAGE HELPERS =====
window.setSlippage = function(val) {
    window.slippage = val;
    window.setValue('customSlippage', val);
    window.setText('slippageVal', val.toFixed(1) + '%');
    window.updateTradeOutput();
};

window.updateCustomSlippage = function() {
    let val = parseFloat(document.getElementById('customSlippage')?.value);
    if (!isNaN(val) && val > 0) {
        if (val > 30) {
            val = 30;
            window.setValue('customSlippage', 30);
        }
        window.slippage = val;
        window.setText('slippageVal', val.toFixed(1) + '%');
        window.updateTradeOutput();
    }
};

// ===== UPDATE TRADE OUTPUT =====
window.gasUpdateTimeout = null;
window.updateTradeOutput = async function() {
    const payAmount = parseFloat(document.getElementById('tradePayAmount')?.value) || 0;
    
    if (!window.poolData || payAmount <= 0 || !window.currentPRC20) {
        window.setValue('tradeRecvAmount', '');
        window.setText('minRecv', '0.00');
        window.setText('priceImpact', '-');
        window.setText('networkFee', '0.00 PAXI');
        return;
    }
    
    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const reservePaxi = parseFloat(window.poolData.reserve_paxi);
    const reservePrc20 = parseFloat(window.poolData.reserve_prc20);
    let outputAmount, priceImpact, targetDecimals;
    
    if (window.tradeType === 'buy') {
        // Buy: PAXI -> TOKEN
        const fromAmountBase = payAmount * 1e6;
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePrc20) / (reservePaxi + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePaxi + amountAfterFee)) * 100;
        targetDecimals = tokenDecimals;
    } else {
        // Sell: TOKEN -> PAXI
        const fromAmountBase = payAmount * Math.pow(10, tokenDecimals);
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePrc20 + amountAfterFee)) * 100;
        targetDecimals = 6;
    }
    
    const outputDisplay = (outputAmount / Math.pow(10, targetDecimals)).toFixed(6);
    window.setValue('tradeRecvAmount', outputDisplay);
    
    // Update Price Impact and Actual Slippage UI
    const impactEl = document.getElementById('priceImpact');
    if (impactEl) {
        window.setText(impactEl, priceImpact.toFixed(2) + '%');
        impactEl.className = priceImpact > 5 ? 'font-mono text-down' :
            priceImpact > 2 ? 'font-mono text-yellow-400' :
            'font-mono text-up';
    }
    
    const actualSlippageEl = document.getElementById('actualSlippage');
    if (actualSlippageEl) {
        // In this context, we show Price Impact as the "Actual Slippage" expected
        window.setText(actualSlippageEl, priceImpact.toFixed(2) + '%');
    }
    
    // Min received with slippage
    const minRecv = (outputAmount * (1 - (window.slippage / 100)) / Math.pow(10, targetDecimals)).toFixed(6);
    const recvSymbol = window.tradeType === 'buy' ? (window.currentTokenInfo?.symbol || 'TOKEN') : 'PAXI';
    window.setText('minRecv', `${minRecv} ${recvSymbol}`);
    
    // Balance Validation & Button state
    const swapBtn = document.querySelector('#mainSwapTerminal button[onclick*="executeTrade"]');
    if (swapBtn && !window.wallet?.isWatchOnly) {
        const rawBal = document.getElementById('payBalance')?.getAttribute('data-raw') || "0";
        const balanceRaw = BigInt(rawBal);
        const amountToPayRaw = BigInt(window.toMicroAmount(payAmount, window.tradeType === 'buy' ? 6 : tokenDecimals));
        
        if (amountToPayRaw > balanceRaw) {
            swapBtn.disabled = true;
            swapBtn.textContent = "INSUFFICIENT BALANCE";
        } else {
            swapBtn.disabled = false;
            swapBtn.textContent = window.tradeType === 'buy' ? "BUY NOW" : "SELL NOW";
        }
    }
    
    // Rate
    const rate = window.tradeType === 'buy' ?
        (outputAmount / (payAmount * 1e6) * Math.pow(10, 6 - tokenDecimals)).toFixed(4) :
        (payAmount / (outputAmount / 1e6)).toFixed(4);
    window.setText('tradeRate', `1 PAXI = ${rate} ${window.currentTokenInfo?.symbol || 'TOKEN'}`);
    if (window.gasUpdateTimeout) clearTimeout(window.gasUpdateTimeout);
    
    window.gasUpdateTimeout = setTimeout(async () => {
        try {
            const response = await window.fetchGasEstimate(1);
            const gasInfo = response?.data ?? response;
            
            if (!gasInfo) {
                window.setText('networkFee', '0.0000 PAXI');
                return;
            }
            
            const feeUpaxi = Number(gasInfo.estimatedFee);
            
            if (Number.isFinite(feeUpaxi)) {
                const feePaxi = feeUpaxi / 1e6;
                window.setText('networkFee', `${feePaxi.toFixed(4)} PAXI`);
            } else {
                window.setText('networkFee', '0.0000 PAXI');
            }
            
        } catch (err) {
            window.setText('networkFee', '0.0000 PAXI');
        }
    }, 1000);
};

// ===== EXECUTE TRADE =====
window.executeTrade = async function() {
    if (!window.wallet) {
        window.showConnectModal();
        return;
    }
    
    if (!window.currentPRC20) {
        return;
    }
    
    const payAmount = parseFloat(document.getElementById('tradePayAmount')?.value);
    if (!payAmount || payAmount <= 0) {
        return;
    }
    
    window.updateTradeOutput();
    
    const minReceivedStr = document.getElementById('minRecv').textContent.split(' ')[0];
    const minReceived = parseFloat(minReceivedStr) || 0;
    const offerDenom = window.tradeType === 'buy' ? window.APP_CONFIG.DENOM : window.currentPRC20;
    
    try {
        await window.executeSwap(window.currentPRC20, offerDenom, payAmount, minReceived);
    } catch (e) {
        console.error(e);
    }
};

// ===== TOGGLE SWAP DIRECTION =====
window.toggleSwapDirection = function() {
    window.swapDirection = window.swapDirection === 'buy' ? 'sell' : 'buy';
    
    const fromSymbolEl = document.getElementById('fromTokenSymbol');
    const toSymbolEl = document.getElementById('toTokenSymbol');
    if (fromSymbolEl && toSymbolEl) {
        const fromSymbol = fromSymbolEl.textContent;
        const toSymbol = toSymbolEl.textContent;
        window.setText(fromSymbolEl, toSymbol);
        window.setText(toSymbolEl, fromSymbol);
    }
    
    const fromBalEl = document.getElementById('fromBalance');
    const toBalEl = document.getElementById('toBalance');
    if (fromBalEl && toBalEl) {
        const fromBalance = fromBalEl.textContent;
        const fromRaw = fromBalEl.getAttribute('data-raw');
        const toBalance = toBalEl.textContent;
        const toRaw = toBalEl.getAttribute('data-raw');
        
        window.setText(fromBalEl, toBalance);
        if (toRaw) fromBalEl.setAttribute('data-raw', toRaw);
        else fromBalEl.removeAttribute('data-raw');
        
        window.setText(toBalEl, fromBalance);
        if (fromRaw) toBalEl.setAttribute('data-raw', fromRaw);
        else toBalEl.removeAttribute('data-raw');
    }
    
    window.setValue('swapFromAmount', '');
    window.setValue('swapToAmount', '');
    window.calculateSwapOutput();
};

// ===== SET SWAP PERCENT =====
window.setSwapPercent = function(percent) {
    if (!window.wallet) return;
    const balEl = document.getElementById('fromBalance');
    if (!balEl) return;
    const rawBal = balEl.getAttribute('data-raw');
    const balance = parseFloat(balEl.textContent.split(' ')[0]) || 0;
    
    let amountStr = '';
    if (rawBal && percent === 100) {
        const decimals = (window.swapDirection === 'buy') ? 6 : (window.currentTokenInfo?.decimals || 6);
        let rawBig = BigInt(rawBal);
        if (window.swapDirection === 'buy') {
            const gasReserve = BigInt(100000);
            if (rawBig > gasReserve) rawBig -= gasReserve;
            else rawBig = 0n;
        }
        const s = rawBig.toString().padStart(decimals + 1, '0');
        amountStr = s.slice(0, -decimals) + '.' + s.slice(-decimals);
        amountStr = amountStr.replace(/\.?0+$/, '');
        if (amountStr.startsWith('.')) amountStr = '0' + amountStr;
    } else {
        amountStr = (balance * percent / 100).toFixed(6);
    }
    
    window.setValue('swapFromAmount', amountStr);
    window.calculateSwapOutput();
};

// ===== CALCULATE SWAP OUTPUT =====
window.calculateSwapOutput = function() {
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value) || 0;
    
    if (!window.poolData || fromAmount <= 0 || !window.currentPRC20) {
        window.setValue('swapToAmount', '');
        window.setText('priceImpact', '-');
        window.setText('minReceived', '-');
        return;
    }
    
    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const reservePaxi = parseFloat(window.poolData.reserve_paxi);
    const reservePrc20 = parseFloat(window.poolData.reserve_prc20);
    let outputAmount, priceImpact, targetDecimals;
    
    if (window.swapDirection === 'buy') {
        // Swap PAXI -> PRC20
        const fromAmountBase = fromAmount * 1e6;
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePrc20) / (reservePaxi + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePaxi + amountAfterFee)) * 100;
        targetDecimals = tokenDecimals;
    } else {
        // Swap PRC20 -> PAXI
        const fromAmountBase = fromAmount * Math.pow(10, tokenDecimals);
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
        priceImpact = (amountAfterFee / (reservePrc20 + amountAfterFee)) * 100;
        targetDecimals = 6;
    }
    
    const outputDisplay = (outputAmount / Math.pow(10, targetDecimals)).toFixed(6);
    window.setValue('swapToAmount', outputDisplay);
    
    const impactEl = document.getElementById('priceImpact');
    window.setText(impactEl, priceImpact.toFixed(3) + '%');
    impactEl.className = priceImpact > 5 ? 'font-semibold text-down' :
        priceImpact > 2 ? 'font-semibold text-yellow-400' :
        'font-semibold text-up';
    
    // Min received with 1% slippage
    const minReceived = (outputAmount * 0.99 / Math.pow(10, targetDecimals)).toFixed(6);
    const toSymbol = window.escapeHtml(document.getElementById('toTokenSymbol').textContent);
    window.setText('minReceived', minReceived + ' ' + toSymbol);
};

// ===== TOGGLE SWAP FEE =====
window.toggleSwapFee = function() {
    // Platform fee is disabled (0 PAXI)
    window.feeEnabled = false;
    localStorage.setItem('swap_fee_enabled', false);
};

// ===== EXECUTE QUICK SWAP =====
window.executeQuickSwap = async function() {
    if (!window.wallet) {
        return;
    }
    
    if (!window.currentPRC20) {
        return;
    }
    
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value);
    if (!fromAmount || fromAmount <= 0) {
        return;
    }
    
    // Calculate min receive for slippage protection (1%)
    window.calculateSwapOutput();
    const minReceivedStr = document.getElementById('minReceived').textContent.split(' ')[0];
    const minReceived = parseFloat(minReceivedStr) || 0;
    
    const offerDenom = window.swapDirection === 'buy' ? window.APP_CONFIG.DENOM : window.currentPRC20;
    
    try {
        await window.executeSwap(window.currentPRC20, offerDenom, fromAmount, minReceived);
    } catch (e) {
        console.error(e);
        // Error notification is handled in buildAndSendTx
    }
};

// ===== EXECUTE SEND (Called from UI) =====
window.executeSend = async function() {
    const token = document.getElementById('sendTokenSelect')?.value;
    const recipient = document.getElementById('sendRecipient')?.value.trim();
    const amount = parseFloat(document.getElementById('sendAmount')?.value);
    
    if (!recipient || amount <= 0) {
        return;
    }
    
    try {
        await window.executeSendTransaction(token, recipient, amount);
        window.hideWalletActions();
    } catch (e) {
        console.error(e);
    }
};

// ===== EXECUTE DONATION (Called from UI) =====
window.executeDonation = async function() {
    const amount = parseFloat(document.getElementById('donationAmount')?.value);
    if (!amount || amount <= 0) {
        return;
    }
    try {
        await window.executeDonationTransaction(amount);
        window.hideDonationModal();
    } catch (e) {
        console.error(e);
    }
};