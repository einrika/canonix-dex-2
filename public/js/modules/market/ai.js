// ============================================
// AI.JS - AI Market Analysis Engine
// ============================================

import { APP_CONFIG } from '../../core/config.js';
import { escapeHtml, addClass, removeClass } from '../../core/utils.js';

// ===== SHOW AI ANALYSIS =====
export const showAIAnalysis = function() {
    removeClass('aiModal', 'hidden');
    generateAIAnalysis();
};

export const hideAI = function() {
    addClass('aiModal', 'hidden');
};

export const calculateRSI = function(prices, period = 14) {
    if (prices.length < period + 1) return 50;

    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

export const calculateEMA = function(prices, period) {
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
};

export const calculateMACD = function(prices) {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = macd * 0.8;

    return {
        macd,
        signal,
        histogram: macd - signal
    };
};

export const calculateVolatility = function(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
};

export const calculateMomentum = function(prices) {
    if (prices.length < 5) return 0;
    const recent = prices.slice(-5);
    const older = prices.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return (recentAvg - olderAvg) / olderAvg;
};

export const findSupportResistance = function(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const len = sorted.length;
    return {
        support: sorted[Math.floor(len * 0.2)],
        resistance: sorted[Math.floor(len * 0.8)]
    };
};

// ===== AI API CALLS =====
export const callServerAI = async function(data) {
    try {
        const response = await fetch(`${APP_CONFIG.BACKEND_API}/api/ai_analysis`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) throw new Error('AI Server error');
        const result = await response.json();
        return result.analysis || '';
    } catch (error) {
        console.error('Server AI failed:', error);
        return null;
    }
};

// ===== GENERATE ADVANCED ANALYSIS (FALLBACK) =====
export const generateAdvancedAnalysis = function(data) {
    const { 
        symbol, latestPrice, change24h, sentiment, trend, rsi, macd,
        volatility, volatilityLabel, liquidity, liquidityScore, volume24h,
        volumeRatio, levels, riskLevel, riskScore, tradeSignal
    } = data;

    let analysis = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 MARKET CONDITION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    analysis += `The market shows a ${sentiment.toUpperCase()} bias with ${trend}.\n`;
    if (Math.abs(change24h) > 20) {
        analysis += `⚠️  EXTREME ${change24h > 0 ? 'PUMP' : 'DUMP'} detected (${change24h.toFixed(1)}%)!\nHigh probability of ${change24h > 0 ? 'correction' : 'bounce'}. Wait for confirmation.\n`;
    } else if (Math.abs(change24h) > 10) {
        analysis += `Strong momentum (${change24h.toFixed(1)}%), but watch for exhaustion signals.\n`;
    } else {
        analysis += `Consolidation phase with low momentum (${change24h.toFixed(1)}%).\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📈 TECHNICAL ANALYSIS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    analysis += `RSI(14): ${rsi.toFixed(1)} - `;
    if (rsi > 70) analysis += `OVERBOUGHT ⚠️\n→ High risk of pullback. Consider profit-taking.\n`;
    else if (rsi < 30) analysis += `OVERSOLD 💎\n→ Potential bounce opportunity if volume supports.\n`;
    else analysis += `Neutral zone.\n`;

    analysis += `\nMACD: ${macd.histogram > 0 ? '🟢 Bullish' : '🔴 Bearish'} signal.\nVolatility: ${(volatility * 100).toFixed(1)}% (${volatilityLabel})`;
    if (volatility > 0.15) analysis += ` - EXTREME RISK!\n`; else analysis += `\n`;

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n💧 LIQUIDITY & VOLUME\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    analysis += `Pool Size: ${liquidity.toFixed(0)} PAXI (${liquidityScore})\n`;
    if (liquidity < 5000) analysis += `⛔ CRITICAL - High slippage risk! Difficult exit.\n→ Slippage: 10-30% on modest trades.\n`;
    else if (liquidity < 20000) analysis += `⚠️  LOW - Moderate slippage expected (3-10%).\n→ Use limit orders, avoid market buys.\n`;
    else analysis += `✅ Sufficient for small-medium trades.\n`;

    analysis += `\nVolume: ${volume24h.toFixed(0)} PAXI (${volumeRatio.toFixed(2)}x avg)\n`;
    if (volumeRatio > 5) analysis += `🚨 ABNORMAL SPIKE - Possible pump scheme!\n→ High chance of dump. Avoid FOMO.\n`;
    else if (volumeRatio > 2) analysis += `📈 HIGH - Strong interest, ${change24h > 0 ? 'buying' : 'selling'} pressure.\n`;
    else if (volumeRatio < 0.5) analysis += `⚠️  LOW - Dying interest. Avoid.\n`;
    else analysis += `→ Normal activity levels.\n`;

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 TRADING STRATEGY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSignal: ${tradeSignal}\nRisk Level: ${riskLevel} (${riskScore}/10)\n\n`;

    if (riskLevel === 'HIGH' && liquidity < 5000) analysis += `🚫 AVOID - Too risky!\n→ Multiple red flags. Wait for better setup.\n`;
    else if (rsi > 75 && volumeRatio > 3) analysis += `⏸️  WAIT - Overextended pump.\n→ Likely 20-40% retrace. Set alert at RSI < 50.\n`;
    else if (rsi < 30 && volumeRatio > 1 && liquidity > 10000) analysis += `⚡ SCALP SETUP\nEntry: ${latestPrice.toFixed(8)}\nTarget: +10-15% (RSI ~50)\nStop: -7% (cut fast)\nSize: Max 2% portfolio\n`;
    else if (trend.includes('UPTREND') && rsi < 65 && liquidity > 15000) analysis += `📊 SWING TRADE\nEntry: On pullback to ${levels.support.toFixed(8)}\nTarget: ${levels.resistance.toFixed(8)} (+20-30%)\nStop: Below ${(levels.support * 0.95).toFixed(8)} (-10%)\nHold: 1-3 days max\n`;
    else analysis += `⏸️  NEUTRAL - No clear edge.\n→ Monitor: RSI, volume, price action.\n→ Better opportunities elsewhere.\n`;

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚠️  RISK DISCLAIMER\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMeme coins are highly speculative.\nNever invest more than you can afford to lose.\nThis is analysis, not financial advice.\n`;
    return analysis;
};

// ===== RENDER ANALYSIS =====
export const renderAnalysis = function(data) {
    const content = document.getElementById('aiContent');
    if (!content) return;

    if (!data) {
        content.innerHTML = `
            <div class="flex flex-col items-center py-20 text-center animate-fade-in">
                <div class="w-16 h-16 bg-card border-4 border-card shadow-brutal flex items-center justify-center text-muted-text text-3xl mb-8 rotate-[-10deg]"><i class="fas fa-chart-line"></i></div>
                <h3 class="text-2xl font-display text-primary-text italic uppercase tracking-tighter mb-4">INITIALIZING DATA...</h3>
                <p class="font-mono text-[8px] text-muted-text font-bold uppercase tracking-widest italic max-w-[200px]">Select a token from the terminal to begin deep neural market analysis.</p>
            </div>`;
        return;
    }
    const { symbol, latestPrice, change24h, sentiment, trend, rsi, volatilityLabel, liquidity, liquidityScore, riskLevel, tradeSignal, aiText, aiSource, aiType } = data;
    const badges = {
        premium: '<span class="px-2 py-0.5 bg-meme-green text-black border border-card text-[8px] font-black italic uppercase">Bionic Premium</span>',
        free: '<span class="px-2 py-0.5 bg-meme-cyan text-black border border-card text-[8px] font-black italic uppercase">Basic AI</span>',
        manual: '<span class="px-2 py-0.5 bg-meme-pink text-primary-text border border-card text-[8px] font-black italic uppercase">Algo Core</span>'
    };

    content.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <div class="bg-surface border-4 border-card p-6 shadow-brutal rotate-[-0.5deg]">
                <h4 class="font-display text-2xl text-meme-cyan mb-6 uppercase italic border-b-2 border-card pb-2"><i class="fas fa-chart-line mr-2"></i> TELEMETRY</h4>
                <div class="grid grid-cols-2 gap-6 font-mono text-[10px] font-bold uppercase tracking-widest">
                    <div><span class="text-muted-text">VIBE:</span> <span class="${sentiment === 'Bullish' ? 'text-meme-green' : 'text-meme-pink'} font-black">${sentiment}</span></div>
                    <div><span class="text-muted-text">SHIFT:</span> <span class="${change24h >= 0 ? 'text-meme-green' : 'text-meme-pink'} font-black">${change24h.toFixed(2)}%</span></div>
                    <div><span class="text-muted-text">FLOW:</span> <span class="text-meme-cyan font-black">${trend}</span></div>
                    <div><span class="text-muted-text">RSI:</span> <span class="${rsi > 70 ? 'text-meme-pink' : rsi < 30 ? 'text-meme-green' : 'text-primary-text'} font-black">${rsi.toFixed(1)}</span></div>
                    <div class="col-span-2 pt-4 border-t border-card"><span class="text-muted-text">DEPTH:</span> <span class="text-primary-text font-black">${liquidity.toFixed(0)} PAXI</span><span class="text-[8px] ml-2 ${liquidityScore === 'High' ? 'text-meme-green' : 'text-meme-pink'} font-black">(${liquidityScore} CAP)</span></div>
                    <div><span class="text-muted-text">HEAT:</span> <span class="text-meme-yellow font-black">${volatilityLabel}</span></div>
                    <div><span class="text-muted-text">RISK:</span> <span class="${riskLevel === 'HIGH' ? 'text-meme-pink' : 'text-meme-green'} font-black">${riskLevel}</span></div>
                </div>
            </div>
            <div class="bg-surface border-4 border-card p-8 shadow-brutal rotate-[0.5deg] relative">
                <div class="absolute -top-4 -right-4 w-12 h-12 bg-meme-pink border-4 border-card flex items-center justify-center text-primary-text rotate-12"><i class="fas fa-robot"></i></div>
                <h4 class="font-display text-2xl text-meme-green mb-6 uppercase italic">${aiType === 'manual' ? 'ALGO STREAM' : 'NEURAL INTERPRETER'}</h4>
                <div class="font-mono text-xs text-gray-300 leading-relaxed uppercase whitespace-pre-wrap selection:bg-meme-green selection:text-black">${escapeHtml(aiText)}</div>
            </div>
            <div class="flex items-center justify-between"><div class="font-mono text-[8px] text-muted-text font-black uppercase tracking-[0.2em]">UPLINK: ${aiSource}</div>${badges[aiType]}</div>
            <div class="p-4 bg-surface border-2 border-meme-pink/20 text-[9px] font-mono text-meme-pink/60 uppercase font-bold italic"><i class="fas fa-exclamation-triangle mr-2"></i> WARNING: PROBABILISTIC DATA. NOT ALPHA. DYOR OR GET REKT.</div>
        </div>`;
};

// ===== MAIN AI ANALYSIS GENERATOR =====
export const generateAIAnalysis = async function() {
    const content = document.getElementById('aiContent');
    if (!content) return;
    if (!window.currentPRC20) { renderAnalysis(null); return; }
    content.innerHTML = `<div class="flex flex-col items-center py-20 text-center animate-pulse"><div class="w-16 h-16 border-4 border-meme-green border-t-transparent rounded-full animate-spin mb-8"></div><span class="font-display text-2xl text-meme-green uppercase italic">Analyzing Market...</span></div>`;

    try {
        const detail = window.tokenDetails.get(window.currentPRC20);
        const history = window.priceHistory || [];
        const prices = history.length > 0 ? history.map(h => h.price) : [detail?.price_paxi || 0];
        const volumes = history.length > 0 ? history.map(h => h.volume || 0) : [detail?.volume_24h || 0];
        const latestPrice = detail?.price_paxi || prices.at(-1) || 0;
        const firstPrice = prices[0] || latestPrice;
        const change24h = detail ? detail.price_change_24h * 100 : ((latestPrice - firstPrice) / (firstPrice || 1)) * 100;
        const liquidity = detail ? detail.liquidity : (parseFloat(window.poolData?.reserve_paxi || 0) / 1e6);
        const volume24h = detail ? detail.volume_24h : (parseFloat(document.getElementById('volume24h')?.textContent) || 0);
        const rsi = prices.length > 1 ? calculateRSI(prices, 14) : 50;
        const macd = prices.length > 1 ? calculateMACD(prices) : { macd: 0, signal: 0, histogram: 0 };
        const volatility = prices.length > 1 ? calculateVolatility(prices) : 0;
        const momentum = prices.length > 1 ? calculateMomentum(prices) : 0;
        const levels = prices.length > 1 ? findSupportResistance(prices) : { support: latestPrice * 0.9, resistance: latestPrice * 1.1 };
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / (volumes.length || 1);
        const volumeRatio = volume24h / (avgVolume || 1);

        let riskScore = 0;
        if (volatility > 0.15) riskScore += 3; else if (volatility > 0.08) riskScore += 2; else riskScore += 1;
        if (liquidity < 5000) riskScore += 3; else if (liquidity < 20000) riskScore += 2; else riskScore += 1;
        if (volumeRatio > 3 || volumeRatio < 0.5) riskScore += 2;
        const riskLevel = riskScore >= 7 ? 'HIGH' : riskScore >= 4 ? 'MEDIUM' : 'LOW';
        const sentiment = change24h >= 0 ? 'Bullish' : 'Bearish';
        const liquidityScore = liquidity > 10000 ? 'High' : liquidity > 5000 ? 'Medium' : 'Low';
        const volatilityLabel = volatility > 0.15 ? 'Extreme' : volatility > 0.08 ? 'High' : volatility > 0.04 ? 'Medium' : 'Low';

        let trend = 'NEUTRAL';
        if (momentum > 0.05 && macd.histogram > 0) trend = 'STRONG UPTREND';
        else if (momentum > 0.02) trend = 'UPTREND';
        else if (momentum < -0.05 && macd.histogram < 0) trend = 'STRONG DOWNTREND';
        else if (momentum < -0.02) trend = 'DOWNTREND';

        let tradeSignal = 'NEUTRAL';
        if (rsi < 30 && volumeRatio > 1 && liquidity > 5000) tradeSignal = 'BUY (Oversold Bounce)';
        else if (rsi > 70 && volumeRatio > 2) tradeSignal = 'SELL (Overbought)';
        else if (sentiment === 'Bullish' && liquidity > 10000 && rsi < 65) tradeSignal = 'BUY (Momentum)';
        else if (riskLevel === 'HIGH') tradeSignal = 'AVOID (High Risk)';

        const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
        const name = window.currentTokenInfo?.name || 'Unknown Token';

        const analysisData = { symbol, price: latestPrice, change24h, liquidity, volume: volume24h, onChainActivity: `Recent RSI: ${rsi.toFixed(2)}, Trend: ${trend}, Volatility: ${volatilityLabel}` };
        let aiText = '', aiSource = '', aiType = '';
        const serverResult = await callServerAI(analysisData);

        if (serverResult) { aiText = serverResult; aiSource = 'Gemini Pro 1.5'; aiType = 'premium'; }
        else {
            aiText = generateAdvancedAnalysis({ symbol, name, latestPrice, change24h, sentiment, trend, rsi, macd, volatility, volatilityLabel, momentum, liquidity, liquidityScore, volume24h, volumeRatio, levels, riskLevel, riskScore, tradeSignal });
            aiSource = 'Canonix Algo'; aiType = 'manual';
        }
        renderAnalysis({ symbol, name, latestPrice, change24h, sentiment, trend, rsi, macd, volatility, volatilityLabel, liquidity, liquidityScore, volume24h, volumeRatio, levels, riskLevel, riskScore, tradeSignal, aiText, aiSource, aiType });
    } catch (err) { console.error(err); content.innerHTML = '<div class="text-center text-red-400 py-8">Analysis failed. Please try again.</div>'; }
};

window.showAIAnalysis = showAIAnalysis;
window.hideAI = hideAI;
window.generateAIAnalysis = generateAIAnalysis;
window.callServerAI = callServerAI;
