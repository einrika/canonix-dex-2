// ============================================
// AI.JS - AI Market Analysis Engine
// ============================================

// ===== SHOW AI ANALYSIS =====
window.showAIAnalysis = function() {
    window.removeClass('aiModal', 'hidden');
    window.generateAIAnalysis();
};

window.hideAI = function() {
    window.addClass('aiModal', 'hidden');
};

window.calculateRSI = function(prices, period = 14) {
    if (prices.length < period + 1) return 50;
    let gains = 0, losses = 0;
    for (let i = prices.length - period; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change; else losses -= change;
    }
    const avgGain = gains / period; const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

window.calculateEMA = function(prices, period) {
    const k = 2 / (period + 1); let ema = prices[0];
    for (let i = 1; i < prices.length; i++) ema = prices[i] * k + ema * (1 - k);
    return ema;
};

window.calculateMACD = function(prices) {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };
    const ema12 = window.calculateEMA(prices, 12);
    const ema26 = window.calculateEMA(prices, 26);
    const macd = ema12 - ema26; const signal = macd * 0.8;
    return { macd, signal, histogram: macd - signal };
};

window.calculateVolatility = function(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
};

window.calculateMomentum = function(prices) {
    if (prices.length < 5) return 0;
    const recent = prices.slice(-5); const older = prices.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return (recentAvg - olderAvg) / olderAvg;
};

window.findSupportResistance = function(prices) {
    const sorted = [...prices].sort((a, b) => a - b); const len = sorted.length;
    return { support: sorted[Math.floor(len * 0.2)], resistance: sorted[Math.floor(len * 0.8)] };
};

window.callServerAI = async function(data) {
    try {
        const response = await fetch('/api/ai_analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('AI Server error');
        const result = await response.json(); return result.analysis || '';
    } catch (error) { console.error('Server AI failed:', error); return null; }
};

window.generateAdvancedAnalysis = function(data) {
    const { 
        symbol, latestPrice, change24h, sentiment, trend, rsi, macd,
        volatility, volatilityLabel, liquidity, liquidityScore, volume24h,
        volumeRatio, levels, riskLevel, riskScore, tradeSignal
    } = data;
    let a = `[ TERMINAL LOG: ${symbol} ]\n`;
    a += `------------------------------\n`;
    a += `SENTIMENT: ${sentiment.toUpperCase()} VIBES\n`;
    a += `TREND: ${trend}\n`;
    if (Math.abs(change24h) > 20) a += `WARNING: EXTREME ${change24h > 0 ? 'PUMP' : 'DUMP'} (${change24h.toFixed(1)}%)\n`;
    a += `\n[ TECH DATA ]\n`;
    a += `RSI: ${rsi.toFixed(1)} -> ${rsi > 70 ? 'OVERBOUGHT (DANGER)' : rsi < 30 ? 'OVERSOLD (BUY?)' : 'NEUTRAL'}\n`;
    a += `MACD: ${macd.histogram > 0 ? 'BULLISH CROSS' : 'BEARISH CROSS'}\n`;
    a += `VOLATILITY: ${(volatility * 100).toFixed(1)}% (${volatilityLabel})\n`;
    a += `\n[ LIQUIDITY ]\n`;
    a += `POOL: ${liquidity.toFixed(0)} PAXI (${liquidityScore})\n`;
    if (liquidity < 5000) a += `CRITICAL: HIGH RUG RISK. LOW EXIT DEPTH.\n`;
    a += `\n[ FINAL VERDICT ]\n`;
    a += `SIGNAL: ${tradeSignal}\n`;
    a += `RISK: ${riskLevel} (${riskScore}/10)\n`;
    return a;
};

window.renderAnalysis = function(data) {
    const {
        symbol, latestPrice, change24h, sentiment, trend, rsi,
        volatilityLabel, liquidity, liquidityScore,
        riskLevel, tradeSignal, aiText, aiSource, aiType
    } = data;
    const content = document.getElementById('aiContent');
    if (!content) return;

    const badges = {
        premium: '<span class="px-2 py-0.5 bg-meme-green text-black border border-black text-[8px] font-black italic uppercase">Bionic Premium</span>',
        free: '<span class="px-2 py-0.5 bg-meme-cyan text-black border border-black text-[8px] font-black italic uppercase">Basic AI</span>',
        manual: '<span class="px-2 py-0.5 bg-meme-pink text-white border border-black text-[8px] font-black italic uppercase">Algo Core</span>'
    };

    content.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <!-- Metrics -->
            <div class="bg-black border-4 border-black p-6 shadow-brutal rotate-[-0.5deg]">
                <h4 class="font-display text-2xl text-meme-cyan mb-6 uppercase italic border-b-2 border-meme-surface pb-2">
                    <i class="fas fa-chart-line mr-2"></i> TELEMETRY
                </h4>
                <div class="grid grid-cols-2 gap-6 font-mono text-[10px] font-bold uppercase tracking-widest">
                    <div><span class="text-gray-600">VIBE:</span> <span class="${sentiment === 'Bullish' ? 'text-meme-green' : 'text-meme-pink'}">${sentiment}</span></div>
                    <div><span class="text-gray-600">SHIFT:</span> <span class="${change24h >= 0 ? 'text-meme-green' : 'text-meme-pink'}">${change24h.toFixed(2)}%</span></div>
                    <div><span class="text-gray-600">FLOW:</span> <span class="text-meme-cyan">${trend}</span></div>
                    <div><span class="text-gray-600">RSI:</span> <span class="${rsi > 70 ? 'text-meme-pink' : rsi < 30 ? 'text-meme-green' : 'text-white'}">${rsi.toFixed(1)}</span></div>
                    <div class="col-span-2 pt-4 border-t border-meme-surface">
                        <span class="text-gray-600">DEPTH:</span> <span class="text-white">${liquidity.toFixed(0)} PAXI</span>
                        <span class="text-[8px] ml-2 ${liquidityScore === 'High' ? 'text-meme-green' : 'text-meme-pink'}">(${liquidityScore} CAP)</span>
                    </div>
                    <div><span class="text-gray-600">HEAT:</span> <span class="text-meme-yellow">${volatilityLabel}</span></div>
                    <div><span class="text-gray-600">RISK:</span> <span class="${riskLevel === 'HIGH' ? 'text-meme-pink' : 'text-meme-green'}">${riskLevel}</span></div>
                </div>
            </div>

            <!-- AI Interpretation -->
            <div class="bg-meme-surface border-4 border-black p-8 shadow-brutal rotate-[0.5deg] relative">
                <div class="absolute -top-4 -right-4 w-12 h-12 bg-meme-pink border-4 border-black flex items-center justify-center text-white rotate-12"><i class="fas fa-robot"></i></div>
                <h4 class="font-display text-2xl text-meme-green mb-6 uppercase italic">${aiType === 'manual' ? 'ALGO STREAM' : 'NEURAL INTERPRETER'}</h4>
                <div class="font-mono text-xs text-gray-300 leading-relaxed uppercase whitespace-pre-wrap selection:bg-meme-green selection:text-black">${window.escapeHtml(aiText)}</div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between">
                <div class="font-mono text-[8px] text-gray-700 font-black uppercase tracking-[0.2em]">
                    UPLINK: ${aiSource}
                </div>
                ${badges[aiType]}
            </div>

            <div class="p-4 bg-black border-2 border-meme-pink/20 text-[9px] font-mono text-meme-pink/60 uppercase font-bold italic">
                <i class="fas fa-exclamation-triangle mr-2"></i> WARNING: PROBABILISTIC DATA. NOT ALPHA. DYOR OR GET REKT.
            </div>
        </div>
    `;
};

window.generateAIAnalysis = async function() {
    const content = document.getElementById('aiContent');
    if (!content) return;
    content.innerHTML = `
        <div class="flex flex-col items-center py-20 text-center animate-pulse">
            <div class="w-16 h-16 border-4 border-meme-green border-t-transparent rounded-full animate-spin mb-8"></div>
            <span class="font-display text-2xl text-meme-green uppercase italic">Linking Neural Core...</span>
        </div>
    `;

    if (!window.priceHistory?.length || !window.currentPRC20 || !window.poolData) {
        content.innerHTML = '<div class="text-center py-20 font-display text-2xl text-gray-700 uppercase italic">Select Target Token</div>';
        return;
    }

    try {
        const prices = window.priceHistory.map(h => h.price); const volumes = window.priceHistory.map(h => h.volume || 0);
        const latestPrice = prices.at(-1); const firstPrice = prices[0];
        const change24h = ((latestPrice - firstPrice) / firstPrice) * 100;
        const liquidity = parseFloat(window.poolData.reserve_paxi || 0) / 1e6;
        const volume24h = parseFloat(document.getElementById('volume24h')?.textContent) || 0;
        const rsi = window.calculateRSI(prices, 14); const macd = window.calculateMACD(prices);
        const volatility = window.calculateVolatility(prices); const momentum = window.calculateMomentum(prices);
        const levels = window.findSupportResistance(prices); const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
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
        if (rsi < 30 && volumeRatio > 1 && liquidity > 5000) tradeSignal = 'BUY (OVERSOLD)';
        else if (rsi > 70 && volumeRatio > 2) tradeSignal = 'SELL (OVERBOUGHT)';
        else if (sentiment === 'Bullish' && liquidity > 10000 && rsi < 65) tradeSignal = 'BUY (MOMENTUM)';
        else if (riskLevel === 'HIGH') tradeSignal = 'AVOID (HIGH RISK)';
        const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
        const analysisData = { symbol, price: latestPrice, change24h, liquidity, volume: volume24h, onChainActivity: `Recent RSI: ${rsi.toFixed(2)}, Trend: ${trend}, Volatility: ${volatilityLabel}` };
        let aiText = ''; let aiSource = ''; let aiType = '';
        const serverResult = await window.callServerAI(analysisData);
        if (serverResult) { aiText = serverResult; aiSource = 'Gemini Pro 1.5'; aiType = 'premium'; }
        else { aiText = window.generateAdvancedAnalysis({ symbol, latestPrice, change24h, sentiment, trend, rsi, macd, volatility, volatilityLabel, momentum, liquidity, liquidityScore, volume24h, volumeRatio, levels, riskLevel, riskScore, tradeSignal }); aiSource = 'Algo-Core V2'; aiType = 'manual'; }
        window.renderAnalysis({ symbol, latestPrice, change24h, sentiment, trend, rsi, macd, volatility, volatilityLabel, liquidity, liquidityScore, volume24h, volumeRatio, levels, riskLevel, riskScore, tradeSignal, aiText, aiSource, aiType });
    } catch (err) { console.error(err); content.innerHTML = '<div class="text-center py-20 font-display text-2xl text-meme-pink uppercase italic">UPLINK ERROR</div>'; }
};
