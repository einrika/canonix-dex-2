// ============================================
// SWAP.JS - Token Swap Operations
// ============================================

// ===== GLOBAL SWAP STATE =====
window.tradeType = 'buy'; // buy or sell
window.orderType = 'instant'; // instant or auto
window.feeEnabled = true;
window.slippage = 1.0;
window.autoOrders = []; // To store pending auto orders

// ===== SET ORDER TYPE (Instant vs Auto) =====
window.setOrderType = function(type) {
    window.orderType = type;
    const btnInstant = document.getElementById('type-instant');
    const btnAuto = document.getElementById('type-auto');
    const autoContainer = document.getElementById('autoOrderContainer');
    const executeBtn = document.querySelector('button[onclick="window.executeTrade()"]') ||
                       document.querySelector('button[onclick="executeTrade()"]');

    if (type === 'auto') {
        window.removeClass(btnInstant, 'bg-border');
        window.removeClass(btnInstant, 'text-white');
        window.addClass(btnInstant, 'text-gray-500');

        window.addClass(btnAuto, 'bg-border');
        window.addClass(btnAuto, 'text-white');
        window.removeClass(btnAuto, 'text-gray-500');

        window.removeClass(autoContainer, 'hidden');
        window.setText(executeBtn, 'CREATE AUTO ORDER');
    } else {
        window.addClass(btnInstant, 'bg-border');
        window.addClass(btnInstant, 'text-white');
        window.removeClass(btnInstant, 'text-gray-500');

        window.removeClass(btnAuto, 'bg-border');
        window.removeClass(btnAuto, 'text-white');
        window.addClass(btnAuto, 'text-gray-500');

        window.addClass(autoContainer, 'hidden');
        window.setText(executeBtn, 'SWAP TOKENS');
    }
};

// ===== SET SWAP MODE (Buy vs Sell) =====
window.setSwapMode = function(mode) {
    window.tradeType = mode;
    const buyTab = document.getElementById('buyTab');
    const sellTab = document.getElementById('sellTab');

    if (mode === 'buy') {
        window.addClass(buyTab, 'bg-up');
        window.addClass(buyTab, 'text-bg');
        window.removeClass(buyTab, 'text-gray-400');

        window.removeClass(sellTab, 'bg-down');
        window.removeClass(sellTab, 'text-bg');
        window.addClass(sellTab, 'text-gray-400');

        window.setText('payTokenSymbol', 'PAXI');
        window.setText('recvTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
    } else {
        window.removeClass(buyTab, 'bg-up');
        window.removeClass(buyTab, 'text-bg');
        window.addClass(buyTab, 'text-gray-400');

        window.addClass(sellTab, 'bg-down');
        window.addClass(sellTab, 'text-bg');
        window.removeClass(sellTab, 'text-gray-400');

        window.setText('payTokenSymbol', window.currentTokenInfo?.symbol || 'TOKEN');
        window.setText('recvTokenSymbol', 'PAXI');
    }

    window.updateTradeOutput();
    if (window.updateTradeBalances) window.updateTradeBalances();
};

// ===== USE CURRENT PRICE AS LIMIT =====
window.useCurrentPriceAsLimit = function() {
    if (window.priceHistory && window.priceHistory.length > 0) {
        const currentPrice = window.priceHistory.at(-1).price;
        window.setValue('limitPriceInput', currentPrice.toFixed(8));
    }
};

// ===== REVERSE TRADE PAIR =====
window.reverseTradePair = function() {
    const newMode = window.tradeType === 'buy' ? 'sell' : 'buy';
    window.setSwapMode(newMode);
};

// ===== SET PERCENT AMOUNT =====
window.setPercentAmount = function(val) {
    const balEl = document.getElementById('payBalance');
    const balanceText = balEl ? balEl.textContent : '0';
    const balance = parseFloat(balanceText) || 0;
    const percent = parseFloat(val) / 100;

    let amount = balance * percent;

    // For native PAXI, leave some for gas if it's a large percentage
    const paySymbol = document.getElementById('payTokenSymbol')?.textContent;
    if ((window.tradeType === 'buy' || paySymbol === 'PAXI') && percent > 0.9) {
        amount = Math.max(0, amount - 0.1);
    }

    window.setValue('tradePayAmount', amount > 0 ? amount.toFixed(6) : '');

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
    const val = parseFloat(document.getElementById('customSlippage')?.value);
    if (!isNaN(val) && val > 0 && val <= 50) {
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
        priceImpact = ((amountAfterFee / reservePaxi) * 100);
        targetDecimals = tokenDecimals;
    } else {
        // Sell: TOKEN -> PAXI
        const fromAmountBase = payAmount * Math.pow(10, tokenDecimals);
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
        priceImpact = ((amountAfterFee / reservePrc20) * 100);
        targetDecimals = 6;
    }

    const outputDisplay = (outputAmount / Math.pow(10, targetDecimals)).toFixed(6);
    window.setValue('tradeRecvAmount', outputDisplay);

    // Min received with slippage
    const minRecv = (outputAmount * (1 - (window.slippage / 100)) / Math.pow(10, targetDecimals)).toFixed(6);
    const recvSymbol = document.getElementById('recvTokenSymbol').textContent;
    window.setText('minRecv', `${minRecv} ${recvSymbol}`);

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
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        window.showConnectModal();
        return;
    }

    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }

    const payAmount = parseFloat(document.getElementById('tradePayAmount')?.value);
    if (!payAmount || payAmount <= 0) {
        window.showNotif('Enter a valid amount', 'error');
        return;
    }

    window.updateTradeOutput();

    if (window.orderType === 'auto') {
        const limitPrice = parseFloat(document.getElementById('limitPriceInput')?.value);
        if (!limitPrice || limitPrice <= 0) {
            window.showNotif('Enter a valid limit price', 'error');
            return;
        }

        const minReceivedStr = document.getElementById('minRecv').textContent.split(' ')[0];
        const minReceived = parseFloat(minReceivedStr) || 0;

        const order = {
            id: Date.now(),
            token: window.currentPRC20,
            symbol: window.currentTokenInfo?.symbol,
            type: window.tradeType,
            payAmount: payAmount,
            limitPrice: limitPrice,
            minReceived: minReceived,
            status: 'pending',
            timestamp: new Date().getTime()
        };

        window.autoOrders.push(order);
        localStorage.setItem('canonix_auto_orders', JSON.stringify(window.autoOrders));

        window.showNotif(`Auto Order Created: ${window.tradeType.toUpperCase()} ${window.currentTokenInfo?.symbol} at ${limitPrice} PAXI`, 'info');
        console.log("Auto Order Added:", order);
        return;
    }

    const minReceivedStr = document.getElementById('minRecv').textContent.split(' ')[0];
    const minReceived = parseFloat(minReceivedStr) || 0;
    const offerDenom = window.tradeType === 'buy' ? window.APP_CONFIG.DENOM : window.currentPRC20;

    try {
        window.showNotif('Broadcasting transaction...', 'info');
        await window.executeSwap(window.currentPRC20, offerDenom, payAmount, minReceived);
    } catch (e) {
        console.error(e);
    }
};

// ===== AUTO ORDER CHECKER =====
// This function should be called periodically (e.g., when price updates)
window.checkAutoOrders = async function(currentToken, currentPrice) {
    if (!window.autoOrders || window.autoOrders.length === 0) return;

    const now = new Date().getTime();
    const oneHour = 3600 * 1000;

    // Auto-expire orders older than 1 hour
    const beforeCount = window.autoOrders.length;
    window.autoOrders = window.autoOrders.filter(order => {
        if (now - order.timestamp > oneHour) {
            console.log(`Auto-expiring Order #${order.id} (expired)`);
            return false;
        }
        return true;
    });

    if (window.autoOrders.length !== beforeCount) {
        localStorage.setItem('canonix_auto_orders', JSON.stringify(window.autoOrders));
    }

    const pendingOrders = window.autoOrders.filter(o => o.status === 'pending' && o.token === currentToken);

    for (const order of pendingOrders) {
        let shouldTrigger = false;

        if (order.type === 'buy') {
            // Trigger if current price is AT OR BELOW limit price
            if (currentPrice <= order.limitPrice) shouldTrigger = true;
        } else {
            // Trigger if current price is AT OR ABOVE limit price
            if (currentPrice >= order.limitPrice) shouldTrigger = true;
        }

        if (shouldTrigger) {
            console.log(`Triggering Auto Order #${order.id}: ${order.type} ${order.symbol} at ${currentPrice}`);
            order.status = 'executing';

            try {
                window.showNotif(`Executing Auto Order: ${order.type.toUpperCase()} ${order.symbol}`, 'info');
                const offerDenom = order.type === 'buy' ? window.APP_CONFIG.DENOM : order.token;

                // For auto orders, we might want to recalculate minReceived based on current price
                // but let's use the one saved when creating the order for safety (slippage already included)
                await window.executeSwap(order.token, offerDenom, order.payAmount, order.minReceived);

                order.status = 'completed';
                window.showNotif(`Auto Order Completed!`, 'success');
            } catch (err) {
                console.error(`Auto Order #${order.id} failed:`, err);
                order.status = 'failed';
                window.showNotif(`Auto Order Failed: ${err.message || 'Unknown error'}`, 'error');
            }

            // Clean up completed/failed orders
            window.autoOrders = window.autoOrders.filter(o => o.id !== order.id);
            localStorage.setItem('canonix_auto_orders', JSON.stringify(window.autoOrders));
        }
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
        const toBalance = toBalEl.textContent;
        window.setText(fromBalEl, toBalance);
        window.setText(toBalEl, fromBalance);
    }
    
    window.setValue('swapFromAmount', '');
    window.setValue('swapToAmount', '');
    window.calculateSwapOutput();
};

// ===== SET SWAP PERCENT =====
window.setSwapPercent = function(percent) {
    if (!window.wallet) {
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    const balEl = document.getElementById('fromBalance');
    if (!balEl) return;
    const balanceText = balEl.textContent;
    const balance = parseFloat(balanceText.split(' ')[0]) || 0;
    const amount = (balance * percent / 100).toFixed(6);
    window.setValue('swapFromAmount', amount);
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
        priceImpact = ((amountAfterFee / reservePaxi) * 100);
        targetDecimals = tokenDecimals;
    } else {
        // Swap PRC20 -> PAXI
        const fromAmountBase = fromAmount * Math.pow(10, tokenDecimals);
        const fee = fromAmountBase * 0.003;
        const amountAfterFee = fromAmountBase - fee;
        outputAmount = (amountAfterFee * reservePaxi) / (reservePrc20 + amountAfterFee);
        priceImpact = ((amountAfterFee / reservePrc20) * 100);
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
    window.feeEnabled = document.getElementById('swapFeeToggle').checked;
    localStorage.setItem('swap_fee_enabled', window.feeEnabled);
};

// ===== EXECUTE QUICK SWAP =====
window.executeQuickSwap = async function() {
    if (!window.wallet) {
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    
    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }
    
    const fromAmount = parseFloat(document.getElementById('swapFromAmount')?.value);
    if (!fromAmount || fromAmount <= 0) {
        window.showNotif('Enter a valid amount', 'error');
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
        window.showNotif('Invalid input', 'error');
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
        window.showNotif('Invalid donation amount', 'error');
        return;
    }
    try {
        await window.executeDonationTransaction(amount);
        window.hideDonationModal();
    } catch (e) {
        console.error(e);
    }
};