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

// ============================================
// AI.JS - AI Market Analysis Engine
// ============================================
window.calculateRSI = function(prices, period = 14) {
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

window.calculateEMA = function(prices, period) {
    const k = 2 / (period + 1);
    let ema = prices[0];
    for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
    }
    return ema;
};

window.calculateMACD = function(prices) {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    const ema12 = window.calculateEMA(prices, 12);
    const ema26 = window.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = macd * 0.8;

    return {
        macd,
        signal,
        histogram: macd - signal
    };
};

window.calculateVolatility = function(prices) {
    if (prices.length < 2) return 0;
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
    return Math.sqrt(variance);
};

window.calculateMomentum = function(prices) {
    if (prices.length < 5) return 0;
    const recent = prices.slice(-5);
    const older = prices.slice(-10, -5);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    return (recentAvg - olderAvg) / olderAvg;
};

window.findSupportResistance = function(prices) {
    const sorted = [...prices].sort((a, b) => a - b);
    const len = sorted.length;
    return {
        support: sorted[Math.floor(len * 0.2)],
        resistance: sorted[Math.floor(len * 0.8)]
    };
};

// ===== AI API CALLS =====
window.callServerAI = async function(data) {
    try {
        const response = await fetch('/api/ai_analysis', {
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
window.generateAdvancedAnalysis = function(data) {
    const { 
        symbol, latestPrice, change24h, sentiment, trend, rsi, macd,
        volatility, volatilityLabel, liquidity, liquidityScore, volume24h,
        volumeRatio, levels, riskLevel, riskScore, tradeSignal
    } = data;

    let analysis = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `📊 MARKET CONDITION\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    analysis += `The market shows a ${sentiment.toUpperCase()} bias with ${trend}.\n`;
    if (Math.abs(change24h) > 20) {
        analysis += `⚠️  EXTREME ${change24h > 0 ? 'PUMP' : 'DUMP'} detected (${change24h.toFixed(1)}%)!\n`;
        analysis += `High probability of ${change24h > 0 ? 'correction' : 'bounce'}. Wait for confirmation.\n`;
    } else if (Math.abs(change24h) > 10) {
        analysis += `Strong momentum (${change24h.toFixed(1)}%), but watch for exhaustion signals.\n`;
    } else {
        analysis += `Consolidation phase with low momentum (${change24h.toFixed(1)}%).\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `📈 TECHNICAL ANALYSIS\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    analysis += `RSI(14): ${rsi.toFixed(1)} - `;
    if (rsi > 70) {
        analysis += `OVERBOUGHT ⚠️\n`;
        analysis += `→ High risk of pullback. Consider profit-taking.\n`;
    } else if (rsi < 30) {
        analysis += `OVERSOLD 💎\n`;
        analysis += `→ Potential bounce opportunity if volume supports.\n`;
    } else {
        analysis += `Neutral zone.\n`;
    }

    analysis += `\nMACD: ${macd.histogram > 0 ? '🟢 Bullish' : '🔴 Bearish'} signal.\n`;
    analysis += `Volatility: ${(volatility * 100).toFixed(1)}% (${volatilityLabel})`;
    if (volatility > 0.15) {
        analysis += ` - EXTREME RISK!\n`;
    } else {
        analysis += `\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `💧 LIQUIDITY & VOLUME\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    // REMOVED $ SYMBOL HERE
    analysis += `Pool Size: ${liquidity.toFixed(0)} PAXI (${liquidityScore})\n`;
    if (liquidity < 5000) {
        analysis += `⛔ CRITICAL - High slippage risk! Difficult exit.\n`;
        analysis += `→ Slippage: 10-30% on modest trades.\n`;
    } else if (liquidity < 20000) {
        analysis += `⚠️  LOW - Moderate slippage expected (3-10%).\n`;
        analysis += `→ Use limit orders, avoid market buys.\n`;
    } else {
        analysis += `✅ Sufficient for small-medium trades.\n`;
    }

    // REMOVED $ SYMBOL HERE
    analysis += `\nVolume: ${volume24h.toFixed(0)} PAXI (${volumeRatio.toFixed(2)}x avg)\n`;
    if (volumeRatio > 5) {
        analysis += `🚨 ABNORMAL SPIKE - Possible pump scheme!\n`;
        analysis += `→ High chance of dump. Avoid FOMO.\n`;
    } else if (volumeRatio > 2) {
        analysis += `📈 HIGH - Strong interest, ${change24h > 0 ? 'buying' : 'selling'} pressure.\n`;
    } else if (volumeRatio < 0.5) {
        analysis += `⚠️  LOW - Dying interest. Avoid.\n`;
    } else {
        analysis += `→ Normal activity levels.\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `🎯 TRADING STRATEGY\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    analysis += `Signal: ${tradeSignal}\n`;
    analysis += `Risk Level: ${riskLevel} (${riskScore}/10)\n\n`;

    if (riskLevel === 'HIGH' && liquidity < 5000) {
        analysis += `🚫 AVOID - Too risky!\n`;
        analysis += `→ Multiple red flags. Wait for better setup.\n`;
    } else if (rsi > 75 && volumeRatio > 3) {
        analysis += `⏸️  WAIT - Overextended pump.\n`;
        analysis += `→ Likely 20-40% retrace. Set alert at RSI < 50.\n`;
    } else if (rsi < 30 && volumeRatio > 1 && liquidity > 10000) {
        analysis += `⚡ SCALP SETUP\n`;
        analysis += `Entry: ${latestPrice.toFixed(8)}\n`;
        analysis += `Target: +10-15% (RSI ~50)\n`;
        analysis += `Stop: -7% (cut fast)\n`;
        analysis += `Size: Max 2% portfolio\n`;
    } else if (trend.includes('UPTREND') && rsi < 65 && liquidity > 15000) {
        analysis += `📊 SWING TRADE\n`;
        analysis += `Entry: On pullback to ${levels.support.toFixed(8)}\n`;
        analysis += `Target: ${levels.resistance.toFixed(8)} (+20-30%)\n`;
        analysis += `Stop: Below ${(levels.support * 0.95).toFixed(8)} (-10%)\n`;
        analysis += `Hold: 1-3 days max\n`;
    } else {
        analysis += `⏸️  NEUTRAL - No clear edge.\n`;
        analysis += `→ Monitor: RSI, volume, price action.\n`;
        analysis += `→ Better opportunities elsewhere.\n`;
    }

    analysis += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `⚠️  RISK DISCLAIMER\n`;
    analysis += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    analysis += `Meme coins are highly speculative.\n`;
    analysis += `Never invest more than you can afford to lose.\n`;
    analysis += `This is analysis, not financial advice.\n`;

    return analysis;
};

// ===== RENDER ANALYSIS =====
window.renderAnalysis = function(data) {
    const {
        symbol, name, latestPrice, change24h, sentiment, trend, rsi, macd,
        volatility, volatilityLabel, liquidity, liquidityScore, volume24h,
        volumeRatio, levels, riskLevel, riskScore, tradeSignal,
        aiText, aiSource, aiType
    } = data;

    const safeAiText = window.escapeHtml(aiText);
    const safeSymbol = window.escapeHtml(symbol);
    const safeName = window.escapeHtml(name);

    const badges = {
        premium: '<span class="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-semibold border border-yellow-500/30">⭐ PREMIUM AI</span>',
        free: '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold border border-blue-500/30">🆓 FREE AI</span>',
        manual: '<span class="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-semibold border border-purple-500/30">🤖 ALGORITHM</span>'
    };

    const content = document.getElementById('aiContent');
    content.innerHTML = `
        <div class="space-y-4">
            <!-- Market Metrics Card -->
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 class="font-semibold mb-3 text-gray-100 flex items-center gap-2">
                    <i class="fas fa-chart-line"></i>
                    Market Metrics
                </h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <span class="text-gray-400">Sentiment:</span>
                        <span class="font-semibold ml-2 ${sentiment === 'Bullish' ? 'text-green-400' : 'text-red-400'}">
                            ${sentiment}
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-400">24h Change:</span>
                        <span class="font-semibold ml-2 ${change24h >= 0 ? 'text-green-400' : 'text-red-400'}">
                            ${change24h.toFixed(2)}%
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-400">Trend:</span>
                        <span class="font-semibold ml-2 text-blue-400">${trend}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">RSI(14):</span>
                        <span class="font-semibold ml-2 ${rsi > 70 ? 'text-red-400' : rsi < 30 ? 'text-green-400' : 'text-gray-300'}">
                            ${rsi.toFixed(1)}
                        </span>
                    </div>
                    <div>
                        <span class="text-gray-400">Liquidity:</span>
                        <!-- REMOVED $ SYMBOL HERE -->
                        <span class="font-semibold ml-2 text-gray-300">${liquidity.toFixed(0)} PAXI</span>
                        <span class="text-xs ml-1 ${
                            liquidityScore === 'High' ? 'text-green-400' : 
                            liquidityScore === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                        }">(${liquidityScore})</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Volatility:</span>
                        <span class="font-semibold ml-2 ${
                            volatilityLabel === 'Extreme' ? 'text-red-400' : 
                            volatilityLabel === 'High' ? 'text-yellow-400' : 'text-gray-300'
                        }">${volatilityLabel}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Risk Level:</span>
                        <span class="font-semibold ml-2 ${
                            riskLevel === 'HIGH' ? 'text-red-400' : 
                            riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                        }">${riskLevel}</span>
                    </div>
                    <div>
                        <span class="text-gray-400">Signal:</span>
                        <span class="font-semibold ml-2 ${
                            tradeSignal.includes('BUY') ? 'text-green-400' : 
                            tradeSignal.includes('SELL') ? 'text-red-400' : 'text-gray-400'
                        }">${tradeSignal}</span>
                    </div>
                </div>
            </div>

            <!-- AI Analysis Card -->
            <div class="bg-gray-900 border border-gray-700 rounded-lg p-4">
                <h4 class="font-semibold mb-3 text-gray-100 flex items-center gap-2">
                    <i class="fas fa-robot text-purple-400"></i>
                    ${aiType === 'manual' ? 'Algorithm Analysis' : 'AI Market Interpretation'}
                </h4>
                <div class="text-xs text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">${safeAiText}</div>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-between text-xs">
                <div class="text-gray-500">
                    <i class="fas fa-brain mr-1"></i>
                    Powered by ${aiSource}
                </div>
                ${badges[aiType]}
            </div>

            <div class="bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-xs text-gray-400">
                <i class="fas fa-exclamation-triangle mr-1 text-yellow-400"></i>
                AI analysis is probabilistic, not financial advice. Always DYOR (Do Your Own Research).
            </div>
        </div>
    `;
};

// ===== MAIN AI ANALYSIS GENERATOR =====
window.generateAIAnalysis = async function() {
    const content = document.getElementById('aiContent');
    content.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            <div class="loading"></div>
            <span class="text-sm text-gray-400">Running advanced AI market analysis...</span>
        </div>
    `;

    if (!window.priceHistory?.length || !window.currentPRC20 || !window.poolData) {
        content.innerHTML = '<div class="text-center text-gray-400 py-8">Select a token to analyze</div>';
        return;
    }

    try {
        const prices = window.priceHistory.map(h => h.price);
        const volumes = window.priceHistory.map(h => h.volume || 0);

        const latestPrice = prices.at(-1);
        const firstPrice = prices[0];
        const change24h = ((latestPrice - firstPrice) / firstPrice) * 100;

        const liquidity = parseFloat(window.poolData.reserve_paxi || 0) / 1e6;
        const volume24h = parseFloat(document.getElementById('volume24h')?.textContent) || 0;

        const rsi = window.calculateRSI(prices, 14);
        const macd = window.calculateMACD(prices);
        const volatility = window.calculateVolatility(prices);
        const momentum = window.calculateMomentum(prices);
        const levels = window.findSupportResistance(prices);

        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        const volumeRatio = volume24h / (avgVolume || 1);

        let riskScore = 0;
        if (volatility > 0.15) riskScore += 3;
        else if (volatility > 0.08) riskScore += 2;
        else riskScore += 1;

        if (liquidity < 5000) riskScore += 3;
        else if (liquidity < 20000) riskScore += 2;
        else riskScore += 1;

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
        if (rsi < 30 && volumeRatio > 1 && liquidity > 5000) {
            tradeSignal = 'BUY (Oversold Bounce)';
        } else if (rsi > 70 && volumeRatio > 2) {
            tradeSignal = 'SELL (Overbought)';
        } else if (sentiment === 'Bullish' && liquidity > 10000 && rsi < 65) {
            tradeSignal = 'BUY (Momentum)';
        } else if (riskLevel === 'HIGH') {
            tradeSignal = 'AVOID (High Risk)';
        }

        const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
        const name = window.currentTokenInfo?.name || 'Unknown Token';

        // Prepare data for Server AI - Strictly real-time
        const analysisData = {
            symbol, 
            price: latestPrice, 
            change24h, 
            liquidity, 
            volume: volume24h,
            onChainActivity: `Recent RSI: ${rsi.toFixed(2)}, Trend: ${trend}, Volatility: ${volatilityLabel}`
        };

        let aiText = '';
        let aiSource = '';
        let aiType = '';

        // Try Server AI (uses hidden API key)
        const serverResult = await window.callServerAI(analysisData);
        
        if (serverResult) {
            aiText = serverResult;
            aiSource = 'Gemini Pro (via Server)';
            aiType = 'premium';
        } else {
            // Fallback to Algorithm
            aiText = window.generateAdvancedAnalysis({
                symbol, name, latestPrice, change24h, sentiment, trend, rsi, macd,
                volatility, volatilityLabel, momentum, liquidity, liquidityScore,
                volume24h, volumeRatio, levels, riskLevel, riskScore, tradeSignal
            });
            aiSource = 'Advanced Algorithm';
            aiType = 'manual';
        }

        window.renderAnalysis({
            symbol, name, latestPrice, change24h, sentiment, trend, rsi, macd,
            volatility, volatilityLabel, liquidity, liquidityScore, volume24h,
            volumeRatio, levels, riskLevel, riskScore, tradeSignal,
            aiText, aiSource, aiType
        });

    } catch (err) {
        console.error(err);
        content.innerHTML = '<div class="text-center text-red-400 py-8">Analysis failed. Please try again.</div>';
    }
};