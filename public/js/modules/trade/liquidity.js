// ============================================
// LIQUIDITY.JS - Liquidity Pool Management
// ============================================

import { setValue, setText } from '../../core/utils.js';

// ===== GLOBAL LP STATE =====
export let lpBalances = {
    paxi: 0,
    token: 0,
    lpTokens: 0
};

// ===== UPDATE SLIDER GRADIENT =====
export const updateSliderGradient = function(sliderId, percent) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    
    const value = Math.min(100, Math.max(0, percent));
    let color = '#8b5cf6'; // Default purple

    if (slider.classList.contains('accent-up')) color = '#00B2D6';
    if (slider.classList.contains('accent-down')) color = '#D60047';

    slider.className = `w-full h-3 bg-[linear-gradient(to_right,${color}_0%,${color}_${Math.round(value)}%,#121314_${Math.round(value)}%,#121314_100%)] rounded-none appearance-none cursor-pointer border-2 border-card shadow-brutal-sm`;
};

// ===== UPDATE LP FROM SLIDER =====
export const updateLPFromSlider = function(type, percent) {
    const balance = type === 'paxi' ? lpBalances.paxi : lpBalances.token;
    const amount = (balance * percent / 100).toFixed(6);
    
    if (type === 'paxi') {
        setValue('lpPaxiAmount', amount);
        updateLPFromInput('paxi');
    } else {
        setValue('lpTokenAmount', amount);
        updateLPFromInput('token');
    }
    
    updateSliderGradient(type === 'paxi' ? 'lpPaxiSlider' : 'lpTokenSlider', percent);
};

// ===== UPDATE LP FROM INPUT =====
export const updateLPFromInput = function(type) {
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
        
        const paxiPercent = lpBalances.paxi > 0 ?
            Math.min(100, (paxiAmount / lpBalances.paxi * 100)) : 0;
        paxiSlider.value = paxiPercent;
        updateSliderGradient('lpPaxiSlider', paxiPercent);
        
        const tokenPercent = lpBalances.token > 0 ?
            Math.min(100, (parseFloat(tokenAmount) / lpBalances.token * 100)) : 0;
        tokenSlider.value = tokenPercent;
        updateSliderGradient('lpTokenSlider', tokenPercent);
        
    } else {
        const tokenAmount = parseFloat(tokenInput.value) || 0;
        const paxiAmount = (tokenAmount / ratio).toFixed(6);
        paxiInput.value = paxiAmount;
        
        const tokenPercent = lpBalances.token > 0 ?
            Math.min(100, (tokenAmount / lpBalances.token * 100)) : 0;
        tokenSlider.value = tokenPercent;
        updateSliderGradient('lpTokenSlider', tokenPercent);
        
        const paxiPercent = lpBalances.paxi > 0 ?
            Math.min(100, (parseFloat(paxiAmount) / lpBalances.paxi * 100)) : 0;
        paxiSlider.value = paxiPercent;
        updateSliderGradient('lpPaxiSlider', paxiPercent);
    }
    
    calculateEstimatedLP();
};

// ===== SET LP PERCENT =====
export const setLPPercent = function(type, percent) {
    const slider = type === 'paxi' ? 
        document.getElementById('lpPaxiSlider') : 
        document.getElementById('lpTokenSlider');
    if (slider) {
        slider.value = percent;
        updateLPFromSlider(type, percent);
    }
};

// ===== CALCULATE ESTIMATED LP =====
export const calculateEstimatedLP = function() {
    const paxiAmount = parseFloat(document.getElementById('lpPaxiAmount')?.value) || 0;
    const tokenAmount = parseFloat(document.getElementById('lpTokenAmount')?.value) || 0;
    
    const estimatedEl = document.getElementById('estimatedLP');
    
    if (!estimatedEl) return;
    
    if (paxiAmount > 0 && tokenAmount > 0 && window.poolData) {
        const tokenDecimals = window.currentTokenInfo?.decimals || 6;
        const lpTokens = Math.sqrt(paxiAmount * 1e6 * tokenAmount * Math.pow(10, tokenDecimals)) / 1e6;
        setText(estimatedEl, `Est. LP: ${lpTokens.toFixed(6)}`);
    } else {
        setText(estimatedEl, '');
    }
};

// ===== UPDATE REMOVE LP FROM SLIDER =====
export const updateRemoveLPFromSlider = function(percent) {
    const amount = (lpBalances.lpTokens * percent / 100).toFixed(6);
    const input = document.getElementById('lpRemoveAmount');
    if (input) {
        input.value = amount;
        updateSliderGradient('lpRemoveSlider', percent);
    }
};

export const updateRemoveLPFromInput = function() {
    const input = document.getElementById('lpRemoveAmount');
    const slider = document.getElementById('lpRemoveSlider');
    if (!input || !slider) return;

    const amount = parseFloat(input.value) || 0;
    const percent = lpBalances.lpTokens > 0 ? Math.min(100, (amount / lpBalances.lpTokens * 100)) : 0;

    slider.value = percent;
    updateSliderGradient('lpRemoveSlider', percent);
};

// ===== SET REMOVE LP PERCENT =====
export const setRemoveLPPercent = function(percent) {
    const slider = document.getElementById('lpRemoveSlider');
    if (slider) {
        slider.value = percent;
        updateRemoveLPFromSlider(percent);
    }
};

// ===== EXECUTE ADD LP =====
export const executeAddLP = async function() {
    if (!window.wallet) return;
    if (!window.currentPRC20) return;
    
    const paxiAmount = parseFloat(document.getElementById('lpPaxiAmount')?.value);
    const tokenAmount = parseFloat(document.getElementById('lpTokenAmount')?.value);
    
    if (!paxiAmount || paxiAmount <= 0 || !tokenAmount || tokenAmount <= 0) return;
    
    try {
        await window.executeAddLPTransaction(window.currentPRC20, paxiAmount, tokenAmount);
        if (window.hideLPModal) window.hideLPModal();
    } catch (e) {
        console.error(e);
    }
};

// ===== EXECUTE REMOVE LP =====
export const executeRemoveLP = async function() {
    if (!window.wallet) return;
    if (!window.currentPRC20) return;
    
    const lpAmount = parseFloat(document.getElementById('lpRemoveAmount')?.value);
    if (!lpAmount || lpAmount <= 0) return;
    
    try {
        await window.executeRemoveLPTransaction(window.currentPRC20, lpAmount);
        if (window.hideLPModal) window.hideLPModal();
    } catch (e) {
        console.error(e);
    }
};

// ===== BURN FEATURES =====
export const setBurnPercent = function(percent) {
    if (!window.currentPRC20 || !window.wallet) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = (balance * percent / 100).toFixed(6);

    setValue('burnAmount', amount > 0 ? amount : '');
    updateSliderGradient('burnSlider', percent);
};

export const updateBurnSliderFromInput = function() {
    if (!window.currentPRC20) return;

    const balance = window.myTokenBalances.get(window.currentPRC20) || 0;
    const amount = parseFloat(document.getElementById('burnAmount')?.value) || 0;
    const percent = balance > 0 ? Math.min(100, (amount / balance * 100)) : 0;

    const slider = document.getElementById('burnSlider');
    if (slider) {
        slider.value = percent;
        updateSliderGradient('burnSlider', percent);
    }
};

export const updateBurnBalanceDisplay = async function() {
    if (!window.currentPRC20 || !window.wallet) return;

    const balEl = document.getElementById('burnBalance');
    if (!balEl) return;

    const tokenDecimals = window.currentTokenInfo?.decimals || 6;
    const balance = await window.getPRC20Balance(window.wallet.address, window.currentPRC20);
    const amount = balance / Math.pow(10, tokenDecimals);
    window.myTokenBalances.set(window.currentPRC20, amount);
    setText(balEl, `Bal: ${amount.toFixed(2)}`);
};

export const executeBurn = async function() {
    if (!window.wallet) return;
    if (!window.currentPRC20) return;

    const amount = parseFloat(document.getElementById('burnAmount')?.value);
    if (!amount || amount <= 0) return;

    try {
        await window.executeBurnTransaction(window.currentPRC20, amount);
        document.getElementById('actionBottomSheet')?.remove();
        setTimeout(async () => {
            if (window.updateBalances) await window.updateBalances();
            await updateBurnBalanceDisplay();
            if (window.WalletUI && window.WalletUI.renderAssets) window.WalletUI.renderAssets();
        }, 3000);
    } catch (e) {
        console.error("Burn failed:", e);
    }
};

window.lpBalances = lpBalances;
window.updateSliderGradient = updateSliderGradient;
window.updateLPFromSlider = updateLPFromSlider;
window.updateLPFromInput = updateLPFromInput;
window.setLPPercent = setLPPercent;
window.calculateEstimatedLP = calculateEstimatedLP;
window.updateRemoveLPFromSlider = updateRemoveLPFromSlider;
window.updateRemoveLPFromInput = updateRemoveLPFromInput;
window.setRemoveLPPercent = setRemoveLPPercent;
window.executeAddLP = executeAddLP;
window.executeRemoveLP = executeRemoveLP;
window.setBurnPercent = setBurnPercent;
window.updateBurnSliderFromInput = updateBurnSliderFromInput;
window.updateBurnBalanceDisplay = updateBurnBalanceDisplay;
window.executeBurn = executeBurn;
