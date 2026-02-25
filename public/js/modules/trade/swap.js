// ============================================
// SWAP.JS - Token Swap Operations
// ============================================

// ===== GLOBAL SWAP STATE =====
window.tradeType = 'buy'; // buy or sell
window.feeEnabled = false; // Platform fee disabled
window.slippage = 30.0;

// ===== SET SWAP MODE (Buy vs Sell) =====
window.setSwapMode = function(mode) {
    window.tradeType = mode;
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');

    if (mode === 'buy') {
        window.addClass(buyTab, 'bg-up');
        window.addClass(buyTab, 'text-bg');
        window.removeClass(buyTab, 'text-secondary-text');

        window.removeClass(sellTab, 'bg-down');
        window.removeClass(sellTab, 'text-bg');
        window.addClass(sellTab, 'text-secondary-text');

        window.setText('payTokenSymbol', 'PAXI');
        window.setText('recvTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
    } else {
        window.removeClass(buyTab, 'bg-up');
        window.removeClass(buyTab, 'text-bg');
        window.addClass(buyTab, 'text-secondary-text');

        window.addClass(sellTab, 'bg-down');
        window.addClass(sellTab, 'text-bg');
        window.removeClass(sellTab, 'text-secondary-text');

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

    // Gas Estimation (Debounced)
    if (window.gasUpdateTimeout) clearTimeout(window.gasUpdateTimeout);
    window.gasUpdateTimeout = setTimeout(async () => {
        try {
            const gasInfo = await window.fetchGasEstimate(1); // Assuming 1 msg for basic swap
            if (gasInfo) {
                window.setText('networkFee', `${parseFloat(gasInfo.estimatedFee).toFixed(4)} PAXI (~$${gasInfo.usdValue})`);
            }
        } catch (e) {
            window.setText('networkFee', 'Error');
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
        if (toRaw) fromBalEl.setAttribute('data-raw', toRaw); else fromBalEl.removeAttribute('data-raw');

        window.setText(toBalEl, fromBalance);
        if (fromRaw) toBalEl.setAttribute('data-raw', fromRaw); else toBalEl.removeAttribute('data-raw');
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