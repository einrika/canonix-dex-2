// ============================================
// LIQUIDITY.JS - Liquidity Pool Management
// ============================================

// ===== GLOBAL LP STATE =====
window.lpBalances = {
    paxi: 0,
    token: 0,
    lpTokens: 0
};

// ===== UPDATE SLIDER GRADIENT =====
window.updateSliderGradient = function(sliderId, percent) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const value = Math.min(100, Math.max(0, percent));
    let color = '#8b5cf6'; // Default purple

    if (slider.classList.contains('accent-up')) color = '#00f2fe';
    if (slider.classList.contains('accent-down')) color = '#ff0080';

    slider.style.background = `linear-gradient(to right, ${color} 0%, ${color} ${value}%, #1f2937 ${value}%, #1f2937 100%)`;
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
    const amount = (window.lpBalances.lpTokens * percent / 100).toFixed(6);
    const input = document.getElementById('lpRemoveAmount');
    if (input) {
        input.value = amount;
        window.updateSliderGradient('lpRemoveSlider', percent);
    }
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
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    
    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }
    
    const paxiAmount = parseFloat(document.getElementById('lpPaxiAmount')?.value);
    const tokenAmount = parseFloat(document.getElementById('lpTokenAmount')?.value);
    
    if (!paxiAmount || paxiAmount <= 0 || !tokenAmount || tokenAmount <= 0) {
        window.showNotif('Enter valid amounts', 'error');
        return;
    }
    
    try {
        await window.executeAddLPTransaction(window.currentPRC20, paxiAmount, tokenAmount);
        window.hideLPModal();
    } catch (e) {
        console.error(e);
    }
};

// ===== EXECUTE REMOVE LP =====
window.executeRemoveLP = async function() {
    if (!window.wallet) {
        window.showNotif(window.NOTIF_CONFIG.CONNECT_WALLET_FIRST, 'error');
        return;
    }
    
    if (!window.currentPRC20) {
        window.showNotif(window.NOTIF_CONFIG.SELECT_TOKEN_FIRST, 'error');
        return;
    }
    
    const lpAmount = parseFloat(document.getElementById('lpRemoveAmount')?.value);
    
    if (!lpAmount || lpAmount <= 0) {
        window.showNotif('Enter valid LP amount', 'error');
        return;
    }
    
    try {
        await window.executeRemoveLPTransaction(window.currentPRC20, lpAmount);
        window.hideLPModal();
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

