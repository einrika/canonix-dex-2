// ============================================
// LIQUIDITY.JS - Liquidity Pool Management
// ============================================

// ===== GLOBAL LP STATE =====
window.lpBalances = {
    paxi: 0,
    token: 0,
    lpTokens: 0
};


// ===== RENDER LP TERMINAL (SIDEBAR) =====
window.renderLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    // Show Loader
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div class="w-16 h-16 border-4 border-meme-cyan border-t-transparent rounded-full animate-spin mb-6 shadow-brutal-sm"></div>
            <p class="font-display text-xl text-primary-text uppercase italic tracking-tighter animate-pulse">Syncing Liquidity Data...</p>
        </div>
    `;

    // Ensure all data is fully loaded and synced
    if (window.fetchPoolData) await window.fetchPoolData();
    if (window.updateTradeBalances) await window.updateTradeBalances();

    const address = window.wallet?.address;
    const prc20 = window.currentPRC20;

    // Explicitly load token details if missing
    if (prc20 && !window.tokenDetails.has(prc20)) {
        await window.loadTokenDetail(prc20);
    }
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';

    let posData = { position: { lp_amount: "0" }, expected_paxi: "0", expected_prc20: "0" };
    if (address && prc20) {
        try {
            const res = await window.fetchDirect(`/api/prc20/lp-position?address=${address}&token=${prc20}`);
            if (res) posData = res;
        } catch (e) { console.error("Failed to fetch LP position:", e); }
    }
    window.currentUserPosition = posData; // Store for slider calculations

    const poolPaxi = window.formatAmount(parseFloat(window.poolData?.reserve_paxi || 0) / 1e6, 2);
    const poolToken = window.formatAmount(parseFloat(window.poolData?.reserve_prc20 || 0) / Math.pow(10, window.currentTokenInfo?.decimals || 6), 2);

    const myPaxi = window.formatAmount(parseFloat(posData.expected_paxi || 0) / 1e6, 2);
    const myToken = window.formatAmount(parseFloat(posData.expected_prc20 || 0) / Math.pow(10, window.currentTokenInfo?.decimals || 6), 2);

    const lpRaw = parseFloat(posData.position?.lp_amount || 0);
    const withdrawLpTotal = window.formatAmount(lpRaw / 1e6, 6);
    window.lpBalances.lpTokens = lpRaw / 1e6; // Sync for removal slider

    container.innerHTML = `
        <div class="space-y-4 animate-fade-in pb-8">
            <div class="flex items-center justify-between border-b border-card pb-2 mb-2">
                <h4 class="text-[10px] font-black text-secondary-text uppercase tracking-widest italic">Liquidity Provision</h4>
                <button onclick="window.cleanupLPTerminal()" class="w-6 h-6 flex items-center justify-center bg-card border border-border text-muted-text hover:text-meme-pink transition-colors"><i class="fas fa-times text-[10px]"></i></button>
            </div>

            <!-- Total Liquidity Pool -->
            <div class="bg-surface border-4 border-card p-4 shadow-brutal-sm rotate-[-0.5deg]">
                <h5 class="text-[10px] font-black text-meme-cyan uppercase tracking-widest mb-3 italic underline decoration-2 underline-offset-4">Total Liquidity Pool</h5>
                <div class="space-y-1">
                    <div class="flex justify-between text-base font-display italic"><span class="text-primary-text">${poolPaxi} PAXI</span></div>
                    <div class="flex justify-between text-base font-display italic"><span class="text-primary-text">${poolToken} <span class="token-symbol-text">${symbol}</span></span></div>
                </div>
            </div>

            <!-- My Position -->
            <div class="bg-surface border-4 border-card p-4 shadow-brutal-sm rotate-[0.5deg]">
                <h5 class="text-[10px] font-black text-meme-green uppercase tracking-widest mb-3 italic underline decoration-2 underline-offset-4">My Position</h5>
                <div class="space-y-1">
                    <div class="flex justify-between text-base font-display italic"><span class="text-primary-text">${withdrawLpTotal} LP Amount</span></div>
                    <div class="flex justify-between text-base font-display italic"><span class="text-primary-text">${myPaxi} PAXI</span></div>
                    <div class="flex justify-between text-base font-display italic"><span class="text-primary-text">${myToken} <span class="token-symbol-text">${symbol}</span></span></div>
                </div>
            </div>

            <!-- Withdraw Amount -->
            <div class="bg-surface border-4 border-card p-4 shadow-brutal-sm rotate-[-0.5deg]">
                <h5 class="text-[10px] font-black text-meme-pink uppercase tracking-widest mb-3 italic underline decoration-2 underline-offset-4">Withdraw Amount</h5>

                <div class="bg-bg border border-border p-3 mb-3">
                    <div class="flex justify-between text-[8px] text-muted-text uppercase font-bold mb-1">Enter LP Amount (via Slider)</div>
                    <div id="lpWithdrawDisplay" class="text-2xl font-display text-primary-text italic leading-none mb-2">0.00 LP</div>
                    <input type="hidden" id="lpRemoveAmount" value="0">
                    <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-card rounded-none appearance-none cursor-pointer accent-meme-pink" oninput="window.updateRemoveLPFromSlider(this.value)">
                </div>

                <div class="space-y-1.5 mb-5 p-2 bg-primary/50 border border-card italic">
                    <div class="flex justify-between text-[9px] font-mono"><span class="text-secondary-text">Est. Paxi</span><span id="lpWithdrawPaxiEst" class="text-primary-text">0.00 PAXI</span></div>
                    <div class="flex justify-between text-[9px] font-mono"><span class="text-secondary-text">Est. <span class="token-symbol-text">${symbol}</span></span><span id="lpWithdrawTokenEst" class="text-primary-text">0.00 <span class="token-symbol-text">${symbol}</span></span></div>
                </div>

                <button onclick="window.executeRemoveLP()" class="w-full py-4 bg-meme-pink text-primary-text font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">Withdraw Now</button>
            </div>

            <!-- Add More Liquidity -->
            <div class="bg-card p-4 border-4 border-card shadow-brutal-sm rotate-[0.5deg]">
                <h5 class="text-[10px] font-black text-meme-green uppercase tracking-widest mb-4 italic">Add More Liquidity</h5>

                <div class="space-y-5">
                    <div class="bg-bg border border-border p-3">
                        <div class="flex justify-between text-[8px] text-secondary-text uppercase mb-1 font-bold">PAXI Amount <span class="opacity-60">Bal: <span id="lpPaxiBalance">0.00</span></span></div>
                        <div id="lpPaxiDisplay" class="text-xl font-display text-primary-text italic mb-2">0.00 PAXI</div>
                        <input type="hidden" id="lpPaxiAmount" value="0">
                        <input type="range" id="lpPaxiSlider" min="0" max="100" step="1" value="0" class="w-full h-1.5 bg-surface rounded-none appearance-none cursor-pointer accent-meme-cyan" oninput="window.updateLPFromSlider('paxi', this.value)">
                    </div>

                    <div class="bg-bg border border-border p-3">
                        <div class="flex justify-between text-[8px] text-secondary-text uppercase mb-1 font-bold"><span class="token-symbol-text">${symbol}</span> Amount <span class="opacity-60">Bal: <span id="lpTokenBalance">0.00</span></span></div>
                        <div id="lpTokenDisplay" class="text-xl font-display text-primary-text italic mb-2">0.00 <span class="token-symbol-text">${symbol}</span></div>
                        <input type="hidden" id="lpTokenAmount" value="0">
                        <input type="range" id="lpTokenSlider" min="0" max="100" step="1" value="0" class="w-full h-1.5 bg-surface rounded-none appearance-none cursor-pointer accent-meme-cyan" oninput="window.updateLPFromSlider('token', this.value)">
                    </div>

                    <div id="estimatedLP" class="text-xs text-meme-green font-display text-center h-4 italic"></div>

                    <button onclick="window.executeAddLP()" class="w-full py-4 bg-meme-green text-black font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none transition-all uppercase italic">Inject LP</button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <button onclick="window.cleanupLPTerminal('wallet')" class="py-3 bg-surface border-2 border-card text-muted-text font-display text-lg uppercase italic hover:text-primary-text transition-all">Back</button>
                <button onclick="window.cleanupLPTerminal()" class="py-3 bg-card border-2 border-card text-meme-pink font-display text-lg uppercase italic transition-all">Close</button>
            </div>
        </div>`;

    if (window.updateLPBalances) await window.updateLPBalances();
};

// ===== UPDATE LP BALANCES =====
window.updateLPBalances = async function() {
    const activeWallet = window.WalletManager?.getActiveWallet();
    const walletAddress = activeWallet?.address || window.wallet?.address;
    if (!walletAddress) return;

    try {
        const balData = await window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${walletAddress}`);
        const balances = balData.balances || [];
        const paxiBalance = balances.find(b => b.denom === 'upaxi');
        const paxiAmount = parseInt(paxiBalance ? paxiBalance.amount : '0') / 1e6;

        let prc20Amount = 0;
        if (window.currentPRC20) {
            const tokenDecimals = window.currentTokenInfo?.decimals || 6;
            const bal = await window.getPRC20Balance(walletAddress, window.currentPRC20);
            prc20Amount = bal / Math.pow(10, tokenDecimals);
        }

        window.lpBalances.paxi = paxiAmount;
        window.lpBalances.token = prc20Amount;

        // Update UI displays if they exist
        const paxiBalEl = document.getElementById('lpPaxiBalance');
        const tokenBalEl = document.getElementById('lpTokenBalance');
        if (paxiBalEl) window.setText(paxiBalEl, paxiAmount.toFixed(2));
        if (tokenBalEl) window.setText(tokenBalEl, prc20Amount.toFixed(2));

    } catch (e) { console.error('LP Balance update failed:', e); }
};

// ===== UPDATE SLIDER GRADIENT =====
window.updateSliderGradient = function(sliderId, percent) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const value = Math.min(100, Math.max(0, percent));

    // Pick color based on slider accent class or default
    let color = '#8b5cf6'; // Default purple
    if (slider.classList.contains('accent-meme-cyan')) color = '#00B2D6';
    if (slider.classList.contains('accent-meme-pink')) color = '#D60047';
    if (slider.classList.contains('accent-meme-green')) color = '#00D68B';

    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${Math.round(value)}%, #121314 ${Math.round(value)}%, #121314 100%)`;
};

// ===== UPDATE LP FROM SLIDER =====
window.updateLPFromSlider = function(type, percent) {
    const balance = type === 'paxi' ? window.lpBalances.paxi : window.lpBalances.token;
    const amount = (balance * percent / 100).toFixed(6);
    
    if (type === 'paxi') {
        window.setValue('lpPaxiAmount', amount);
        window.updateLPFromInput('paxi');
    } else {
        window.setValue('lpTokenAmount', amount);
        window.updateLPFromInput('token');
    }
    
    window.updateSliderGradient(type === 'paxi' ? 'lpPaxiSlider' : 'lpTokenSlider', percent);

    // UI Feedback for amount
    const displayEl = document.getElementById(type === 'paxi' ? 'lpPaxiDisplay' : 'lpTokenDisplay');
    if (displayEl) {
        if (type === 'paxi') {
            window.setText(displayEl, `${amount} PAXI`);
        } else {
            const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
            window.setHtml(displayEl, `${amount} <span class="token-symbol-text">${symbol}</span>`);
        }
    }

    window.calculateEstimatedLP();
};

// ===== UPDATE LP FROM INPUT =====
window.updateLPFromInput = function(type) {
    if (!window.poolData) return;
    
    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const reservePaxi = parseFloat(window.poolData.reserve_paxi) / 1000000;
    const reserveToken = parseFloat(window.poolData.reserve_prc20) / Math.pow(10, tokenDecimals);
    
    if (reservePaxi === 0 || reserveToken === 0) return;
    
    const ratio = reserveToken / reservePaxi;
    
    const paxiInput = document.getElementById('lpPaxiAmount');
    const tokenInput = document.getElementById('lpTokenAmount');
    const paxiSlider = document.getElementById('lpPaxiSlider');
    const tokenSlider = document.getElementById('lpTokenSlider');
    
    if (!paxiInput || !tokenInput || !paxiSlider || !tokenSlider) return;
    
    if (type === 'paxi') {
        const paxiAmount = parseFloat(paxiInput.value) || 0;
        const tokenAmount = (paxiAmount * ratio).toFixed(6);
        tokenInput.value = tokenAmount;
        
        const paxiPercent = window.lpBalances.paxi > 0 ? 
            Math.min(100, (paxiAmount / window.lpBalances.paxi * 100)) : 0;
        paxiSlider.value = paxiPercent;
        window.updateSliderGradient('lpPaxiSlider', paxiPercent);
        
        const tokenPercent = window.lpBalances.token > 0 ? 
            Math.min(100, (parseFloat(tokenAmount) / window.lpBalances.token * 100)) : 0;
        tokenSlider.value = tokenPercent;
        window.updateSliderGradient('lpTokenSlider', tokenPercent);

        // UI Feedback for the calculated asset
        const displayEl = document.getElementById('lpTokenDisplay');
        if (displayEl) {
            const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
            window.setHtml(displayEl, `${tokenAmount} <span class="token-symbol-text">${symbol}</span>`);
        }
        
    } else {
        const tokenAmount = parseFloat(tokenInput.value) || 0;
        const paxiAmount = (tokenAmount / ratio).toFixed(6);
        paxiInput.value = paxiAmount;
        
        const tokenPercent = window.lpBalances.token > 0 ? 
            Math.min(100, (tokenAmount / window.lpBalances.token * 100)) : 0;
        tokenSlider.value = tokenPercent;
        window.updateSliderGradient('lpTokenSlider', tokenPercent);
        
        const paxiPercent = window.lpBalances.paxi > 0 ? 
            Math.min(100, (parseFloat(paxiAmount) / window.lpBalances.paxi * 100)) : 0;
        paxiSlider.value = paxiPercent;
        window.updateSliderGradient('lpPaxiSlider', paxiPercent);

        // UI Feedback for the calculated asset
        const displayEl = document.getElementById('lpPaxiDisplay');
        if (displayEl) {
            window.setText(displayEl, `${paxiAmount} PAXI`);
        }
    }
    
    window.calculateEstimatedLP();
};

// ===== SET LP PERCENT =====
window.setLPPercent = function(type, percent) {
    const slider = type === 'paxi' ? 
        document.getElementById('lpPaxiSlider') : 
        document.getElementById('lpTokenSlider');
    if (slider) {
        slider.value = percent;
        window.updateLPFromSlider(type, percent);
    }
};

// ===== CALCULATE ESTIMATED LP =====
window.calculateEstimatedLP = function() {
    const paxiAmount = parseFloat(document.getElementById('lpPaxiAmount')?.value) || 0;
    const tokenAmount = parseFloat(document.getElementById('lpTokenAmount')?.value) || 0;
    
    const estimatedEl = document.getElementById('estimatedLP');
    
    if (!estimatedEl) return;
    
    if (paxiAmount > 0 && tokenAmount > 0 && window.poolData) {
        const tokenDecimals = window.currentTokenInfo?.decimals || 6;
        // Approximate LP calculation: sqrt(x * y)
        // x = paxiAmount * 10^6, y = tokenAmount * 10^decimals
        const lpTokens = Math.sqrt(paxiAmount * 1e6 * tokenAmount * Math.pow(10, tokenDecimals)) / 1e6;
        window.setText(estimatedEl, `Est. LP: ${lpTokens.toFixed(6)}`);
    } else {
        window.setText(estimatedEl, '');
    }
};

// ===== UPDATE REMOVE LP FROM SLIDER =====
window.updateRemoveLPFromSlider = function(percent) {
    const lpAmount = (window.lpBalances.lpTokens * percent / 100);
    const amountStr = lpAmount.toFixed(6);

    const input = document.getElementById('lpRemoveAmount');
    if (input) {
        input.value = amountStr;
        window.updateSliderGradient('lpRemoveSlider', percent);
    }

    // UI Feedback for Withdrawal Estimation
    const lpDisplay = document.getElementById('lpWithdrawDisplay');
    if (lpDisplay) window.setText(lpDisplay, `${amountStr} LP`);

    // Calculate Estimated Returns based on percentage of total user position
    if (window.currentUserPosition) {
        const paxiEst = (parseFloat(window.currentUserPosition.expected_paxi || 0) * percent / 100) / 1e6;
        const tokenEst = (parseFloat(window.currentUserPosition.expected_prc20 || 0) * percent / 100) / Math.pow(10, window.currentTokenInfo?.decimals || 6);

        const paxiEl = document.getElementById('lpWithdrawPaxiEst');
        const tokenEl = document.getElementById('lpWithdrawTokenEst');

        if (paxiEl) window.setText(paxiEl, `${paxiEst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})} PAXI`);
        if (tokenEl) {
            const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
            window.setHtml(tokenEl, `${tokenEst.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})} <span class="token-symbol-text">${symbol}</span>`);
        }
    }
};

window.updateRemoveLPFromInput = function() {
    const input = document.getElementById('lpRemoveAmount');
    const slider = document.getElementById('lpRemoveSlider');
    if (!input || !slider) return;

    const amount = parseFloat(input.value) || 0;
    const percent = window.lpBalances.lpTokens > 0 ? Math.min(100, (amount / window.lpBalances.lpTokens * 100)) : 0;

    slider.value = percent;
    window.updateSliderGradient('lpRemoveSlider', percent);
};

// ===== SET REMOVE LP PERCENT =====
window.setRemoveLPPercent = function(percent) {
    const slider = document.getElementById('lpRemoveSlider');
    if (slider) {
        slider.value = percent;
        window.updateRemoveLPFromSlider(percent);
    }
};

// ===== EXECUTE ADD LP =====
window.executeAddLP = async function() {
    if (!window.wallet) {
                return;
    }
    
    if (!window.currentPRC20) {
                return;
    }
    
    const paxiAmount = parseFloat(document.getElementById('lpPaxiAmount')?.value);
    const tokenAmount = parseFloat(document.getElementById('lpTokenAmount')?.value);
    
    if (!paxiAmount || paxiAmount <= 0 || !tokenAmount || tokenAmount <= 0) {
                return;
    }
    
    try {
        await window.executeAddLPTransaction(window.currentPRC20, paxiAmount, tokenAmount);
        if (window.closeAllSidebars) window.closeAllSidebars();
    } catch (e) {
        console.error(e);
    }
};

// ===== EXECUTE REMOVE LP =====
window.executeRemoveLP = async function() {
    if (!window.wallet) {
                return;
    }
    
    if (!window.currentPRC20) {
                return;
    }
    
    const lpAmount = parseFloat(document.getElementById('lpRemoveAmount')?.value);
    
    if (!lpAmount || lpAmount <= 0) {
                return;
    }
    
    try {
        await window.executeRemoveLPTransaction(window.currentPRC20, lpAmount);
        if (window.closeAllSidebars) window.closeAllSidebars();
    } catch (e) {
        console.error(e);
    }
};

// ===== BURN FEATURES =====
window.setBurnPercent = function(percent) {
    if (!window.currentPRC20 || !window.wallet) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = (balance * percent / 100).toFixed(6);

    window.setValue('burnAmount', amount > 0 ? amount : '');
    window.updateSliderGradient('burnSlider', percent);
};

window.updateBurnSliderFromInput = function() {
    if (!window.currentPRC20) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = parseFloat(document.getElementById('burnAmount')?.value) || 0;
    const percent = balance > 0 ? Math.min(100, (amount / balance * 100)) : 0;

    const slider = document.getElementById('burnSlider');
    if (slider) {
        slider.value = percent;
        window.updateSliderGradient('burnSlider', percent);
    }
};

window.updateBurnBalanceDisplay = async function() {
    if (!window.currentPRC20 || !window.wallet) return;

    const balEl = document.getElementById('burnBalance');
    if (!balEl) return;

    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const balance = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
    const amount = balance / Math.pow(10, tokenDecimals);
    window.myTokenBalances.set(window.currentPRC20, amount);
    window.setText(balEl, `Bal: ${amount.toFixed(2)}`);
};

window.executeBurn = async function() {
    if (!window.wallet) {
                return;
    }

    if (!window.currentPRC20) {
                return;
    }

    const amount = parseFloat(document.getElementById('burnAmount')?.value);

    if (!amount || amount <= 0) {
                return;
    }

    try {
        await window.executeBurnTransaction(window.currentPRC20, amount);

        // Close bottom sheet if open
        document.getElementById('actionBottomSheet')?.remove();

        // Refresh balances
        setTimeout(async () => {
            if (window.updateBalances) await window.updateBalances();
            if (window.updateBurnBalanceDisplay) await window.updateBurnBalanceDisplay();
            if (window.WalletUI && window.WalletUI.renderAssets) window.WalletUI.renderAssets();
        }, 3000);

    } catch (e) {
        console.error("Burn failed:", e);
    }
};

// ===== UNIFIED CLEANUP FOR LP TERMINAL =====
window.cleanupLPTerminal = function(tabToSet = null) {
    document.getElementById('actionBottomSheet')?.remove();
    if (window.closeAllSidebars) window.closeAllSidebars();
    if (tabToSet && window.setSidebarTab) window.setSidebarTab(tabToSet);
};
