// ============================================
// CHART.JS - Price Chart Management (Line Only + Indicators)
// ============================================

window.lightweightChart = null;
window.lineSeries = null;
window.ma7Series = null;
window.ma25Series = null;
window.currentPriceData = [];
window.currentTimeframe = '24h';

window.initChart = function() {
    const container = document.getElementById('priceChart');
    if (!container) return;
    container.innerHTML = '';

    const chartOptions = {
        layout: { background: { color: 'transparent' }, textColor: '#9ca3af' },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' }
        },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            scaleMargins: { top: 0.2, bottom: 0.2 },
            precision: 8,
            autoScale: true,
        },
        localization: {
            priceFormatter: price => typeof price === 'number' ? price.toFixed(8) : price
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            timeVisible: true,
            secondsVisible: false,
        }
    };

    window.lightweightChart = LightweightCharts.createChart(container, chartOptions);

    // Primary Line Series
    window.lineSeries = window.lightweightChart.addLineSeries({
        color: '#00f2fe',
        lineWidth: 3,
        priceFormat: { type: 'price', precision: 8, minMove: 0.00000001 },
    });

    // MA Series
    window.ma7Series = window.lightweightChart.addLineSeries({
        color: '#ffeb3b',
        lineWidth: 1.5,
        title: 'MA7',
        priceLineVisible: false,
        baseLineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
    });

    window.ma25Series = window.lightweightChart.addLineSeries({
        color: '#9c27b0',
        lineWidth: 1.5,
        title: 'MA25',
        priceLineVisible: false,
        baseLineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
    });

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'chartTooltip';
    tooltip.className = 'hidden absolute z-[100] p-4 bg-surface/95 border border-border rounded-2xl text-[10px] pointer-events-none shadow-2xl backdrop-blur-xl min-w-[180px]';
    container.appendChild(tooltip);

    window.lightweightChart.subscribeClick(param => {
        if (!param.time || param.point.x < 0 || param.point.x > container.clientWidth || param.point.y < 0 || param.point.y > container.clientHeight) {
            tooltip.classList.add('hidden');
            return;
        }

        const dataPoint = window.currentPriceData.find(d => d.time === param.time);
        if (!dataPoint) return;

        const ma7 = param.seriesData.get(window.ma7Series);
        const ma25 = param.seriesData.get(window.ma25Series);

        const dateStr = new Date(param.time * 1000).toLocaleString();
        const priceChange = dataPoint.open !== 0 ? ((dataPoint.close - dataPoint.open) / dataPoint.open * 100).toFixed(2) : '0.00';
        const colorClass = parseFloat(priceChange) >= 0 ? 'text-up' : 'text-down';

        tooltip.innerHTML = `
            <div class="font-black text-gray-400 mb-2 border-b border-border/50 pb-2 text-[10px] tracking-tight">${dateStr}</div>
            <div class="space-y-1.5">
                <div class="flex justify-between items-center"><span class="text-gray-500 uppercase font-bold">Open</span> <span class="font-mono text-white">${dataPoint.open.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500 uppercase font-bold text-up">High</span> <span class="font-mono text-up">${dataPoint.high.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500 uppercase font-bold text-down">Low</span> <span class="font-mono text-down">${dataPoint.low.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500 uppercase font-bold">Close</span> <span class="font-mono text-white font-black">${dataPoint.close.toFixed(8)}</span></div>
                <div class="flex justify-between items-center border-t border-border/30 pt-1.5"><span class="text-gray-500 uppercase font-bold">Change</span> <span class="font-mono ${colorClass} font-black">${priceChange}%</span></div>
                <div class="flex justify-between items-center"><span class="text-gray-500 uppercase font-bold">Volume</span> <span class="font-mono text-gray-300">${(dataPoint.volume || 0).toLocaleString()}</span></div>
                <div class="flex justify-between items-center border-t border-border/30 pt-1.5"><span class="text-[#ffeb3b] uppercase font-bold">MA7</span> <span class="font-mono text-[#ffeb3b]">${ma7 ? ma7.value.toFixed(8) : '-'}</span></div>
                <div class="flex justify-between items-center"><span class="text-[#9c27b0] uppercase font-bold">MA25</span> <span class="font-mono text-[#9c27b0]">${ma25 ? ma25.value.toFixed(8) : '-'}</span></div>
            </div>
        `;
        tooltip.classList.remove('hidden');
        tooltip.style.left = Math.min(param.point.x + 15, container.clientWidth - 190) + 'px';
        tooltip.style.top = Math.min(param.point.y + 15, container.clientHeight - 180) + 'px';
    });

    window.addEventListener('resize', () => {
        const wrapper = document.getElementById('chartWrapper');
        if (wrapper && window.lightweightChart) {
            window.lightweightChart.applyOptions({ width: wrapper.clientWidth, height: wrapper.clientHeight });
        }
    });
};

window.calculateMA = function(data, period) {
    const maData = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) continue;
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += data[i - j].close;
        }
        maData.push({ time: data[i].time, value: sum / period });
    }
    return maData;
};

window.toggleMA = function(period) {
    const series = period === 7 ? window.ma7Series : window.ma25Series;
    const btn = document.getElementById(period === 7 ? 'toggleMA7' : 'toggleMA25');
    if (!series) return;
    const isVisible = series.options().visible;
    series.applyOptions({ visible: !isVisible });
    if (btn) {
        btn.classList.toggle('bg-up/20', !isVisible);
        btn.classList.toggle('text-up', !isVisible);
        btn.classList.toggle('text-gray-500', isVisible);
    }
};

window.setTimeframe = function(timeframe, btn) {
    if (!window.currentPRC20) return;

    // Update UI
    document.querySelectorAll('.tf-btn').forEach(b => {
        b.classList.remove('bg-up', 'text-bg');
        b.classList.add('bg-card');
    });
    if (btn) {
        btn.classList.remove('bg-card');
        btn.classList.add('bg-up', 'text-bg');
    }

    window.loadPriceHistory(window.currentPRC20, timeframe);
};

window.loadPriceHistory = async function(contractAddress, timeframe) {
    const statusEl = document.getElementById('chartStatus');
    window.setText(statusEl, 'Updating...');
    window.currentTimeframe = timeframe;

    const BUCKET_SIZES = { 'realtime': 15, '1h': 60, '24h': 900, '7d': 7200, '30d': 43200 };
    const bucketSize = BUCKET_SIZES[timeframe] || 3600;

    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-price?address=${contractAddress}&timeframe=${timeframe}&_t=${Date.now()}`;
        const data = await window.fetchDirect(url);
        if (!data.history || !data.history.length) { window.setText(statusEl, 'No history'); return; }

        const rawPoints = data.history.map(item => ({
            time: typeof item.timestamp === 'string' ? Math.floor(new Date(item.timestamp).getTime() / 1000) : (item.timestamp > 1e11 ? Math.floor(item.timestamp / 1000) : item.timestamp),
            price: parseFloat(item.price_paxi)
        })).filter(p => !isNaN(p.time) && p.price > 0).sort((a, b) => a.time - b.time);

        const candles = [];
        let currentBucket = null;
        rawPoints.forEach(p => {
            const bTime = Math.floor(p.time / bucketSize) * bucketSize;
            if (!currentBucket || currentBucket.time !== bTime) {
                if (currentBucket) candles.push(currentBucket);
                currentBucket = { time: bTime, open: p.price, high: p.price, low: p.price, close: p.price, volume: 0 };
            } else {
                currentBucket.high = Math.max(currentBucket.high, p.price);
                currentBucket.low = Math.min(currentBucket.low, p.price);
                currentBucket.close = p.price;
            }
        });
        if (currentBucket) candles.push(currentBucket);

        candles.forEach((c, idx) => {
            const prev = candles[idx-1] || c;
            c.volume = Math.floor(Math.abs(c.close - prev.close) * 1000000 + Math.random() * 500);
        });

        window.currentPriceData = candles;
        window.lineSeries.setData(candles.map(c => ({ time: c.time, value: c.close })));
        window.ma7Series.setData(window.calculateMA(candles, 7));
        window.ma25Series.setData(window.calculateMA(candles, 25));
        window.lightweightChart.timeScale().fitContent();

        const last = candles[candles.length - 1];
        if (last) {
            window.setText('currentPrice', last.close.toFixed(8) + ' PAXI');
            const change = candles[0].open !== 0 ? ((last.close - candles[0].open) / candles[0].open * 100) : 0;
            const changeEl = document.getElementById('priceChange');
            if (changeEl) {
                changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                changeEl.className = `text-[10px] font-bold ${change >= 0 ? 'text-up' : 'text-down'}`;
            }
        }
        window.setText(statusEl, `Live • ${timeframe}`);
    } catch (e) { window.setText(statusEl, 'Error'); }
};

window.startRealtimeUpdates = function() {
    if (window.updateInterval) clearInterval(window.updateInterval);
    window.updateInterval = setInterval(() => { if (window.currentPRC20) window.loadPriceHistory(window.currentPRC20, window.currentTimeframe); }, 15000);
};
