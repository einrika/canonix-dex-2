// ============================================
// PRICECHART LOGIC
// ============================================

import { setText } from '../core/utils.js';
import { APP_CONFIG } from '../core/config.js';

export let lightweightChart = null;
export let lineSeries = null;
export let ma7Series = null;
export let ma25Series = null;
export let currentPriceData = [];
export let currentTimeframe = localStorage.getItem('chartTimeframe') || 'realtime';
export let refreshCountdown = 10;
export let countdownInterval = null;

export const PriceChartLogic = (container) => {
    container.querySelectorAll('#chart-controls .tf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => setTimeframe(btn.dataset.tf, e.currentTarget));
    });
    container.querySelector('#toggleMA7')?.addEventListener('click', () => toggleMA(7));
    container.querySelector('#toggleMA25')?.addEventListener('click', () => toggleMA(25));

    // Initialize chart if not already done
    setTimeout(() => {
        initChart();
        if (window.currentPRC20) {
            loadPriceHistory(window.currentPRC20, currentTimeframe);
        }
    }, 100);

    // Listen for WebSocket price updates
    window.addEventListener('paxi_price_updated_socket', (e) => {
        const data = e.detail;
        if (data.address === window.currentPRC20 && data.price_paxi) {
            updateLivePrice(data.price_paxi);
        }
    });
};

// WebSocket logic for live price updates
export const updateLivePrice = function(price) {
    if (!lineSeries || currentTimeframe !== 'realtime') return;

    const now = Math.floor(Date.now() / 1000);
    const newPoint = { time: now, value: parseFloat(price) };

    lineSeries.update(newPoint);

    // Update local data array for indicators
    const last = currentPriceData[currentPriceData.length - 1];
    if (last && last.time === now) {
        last.close = newPoint.value;
        last.value = newPoint.value;
        last.high = Math.max(last.high, newPoint.value);
        last.low = Math.min(last.low, newPoint.value);
    } else {
        currentPriceData.push({
            time: now,
            open: newPoint.value,
            high: newPoint.value,
            low: newPoint.value,
            close: newPoint.value,
            value: newPoint.value,
            volume: Math.floor(Math.random() * 100)
        });
    }

    // Keep data size manageable
    if (currentPriceData.length > 300) currentPriceData.shift();

    // Re-calculate MA if visible
    if (ma7Series.options().visible) ma7Series.setData(calculateMA(currentPriceData, 7));
    if (ma25Series.options().visible) ma25Series.setData(calculateMA(currentPriceData, 25));

    const statusEl = document.getElementById('chartStatus');
    if (statusEl) setText(statusEl, 'Live • WebSocket Active');
};

export const initChart = function() {
    const container = document.getElementById('priceChart');
    if (!container) return;
    container.innerHTML = '';

    // LightweightCharts is assumed global
    if (typeof LightweightCharts === 'undefined') {
        console.error('LightweightCharts not found');
        return;
    }

    const chartOptions = {
        layout: { background: { color: 'transparent' }, textColor: '#B3B3B3' },
        grid: {
            vertLines: { color: 'rgba(250, 250, 250, 0.05)' },
            horzLines: { color: 'rgba(250, 250, 250, 0.05)' }
        },
        crosshair: { mode: LightweightCharts.CrosshairMode.Normal },
        rightPriceScale: {
            borderColor: 'rgba(250, 250, 250, 0.1)',
            scaleMargins: { top: 0.2, bottom: 0.2 },
            precision: 8,
            autoScale: true,
        },
        localization: {
            priceFormatter: price => typeof price === 'number' ? price.toFixed(8) : price
        },
        timeScale: {
            borderColor: 'rgba(250, 250, 250, 0.1)',
            timeVisible: true,
            secondsVisible: false,
        }
    };

    lightweightChart = LightweightCharts.createChart(container, chartOptions);

    // Primary Area Series
    lineSeries = lightweightChart.addAreaSeries({
        topColor: 'rgba(0, 209, 255, 0.4)',
        bottomColor: 'rgba(0, 209, 255, 0.0)',
        lineColor: '#00D1FF',
        lineWidth: 2,
        priceFormat: { type: 'price', precision: 8, minMove: 0.00000001 },
    });

    // MA Series
    const ma7Visible = localStorage.getItem('ma7Visible') === 'true';
    const ma25Visible = localStorage.getItem('ma25Visible') === 'true';

    ma7Series = lightweightChart.addLineSeries({
        color: '#ffeb3b',
        lineWidth: 1.5,
        title: 'MA7',
        priceLineVisible: false,
        baseLineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        visible: ma7Visible
    });

    ma25Series = lightweightChart.addLineSeries({
        color: '#9c27b0',
        lineWidth: 1.5,
        title: 'MA25',
        priceLineVisible: false,
        baseLineVisible: false,
        crosshairMarkerVisible: false,
        lastValueVisible: false,
        visible: ma25Visible
    });

    // Update buttons state
    const btn7 = document.getElementById('toggleMA7');
    const btn25 = document.getElementById('toggleMA25');
    if (btn7) {
        btn7.classList.toggle('bg-up/20', ma7Visible);
        btn7.classList.toggle('text-up', ma7Visible);
        btn7.classList.toggle('border-up/30', ma7Visible);
        btn7.classList.toggle('text-secondary-text', !ma7Visible);
    }
    if (btn25) {
        btn25.classList.toggle('bg-up/20', ma25Visible);
        btn25.classList.toggle('text-up', ma25Visible);
        btn25.classList.toggle('border-up/30', ma25Visible);
        btn25.classList.toggle('text-secondary-text', !ma25Visible);
    }

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'chartTooltip';
    tooltip.className = 'hidden absolute z-[100] p-4 bg-surface/95 border border-border rounded-2xl text-[10px] pointer-events-none shadow-2xl backdrop-blur-xl min-w-[180px]';
    container.appendChild(tooltip);

    lightweightChart.subscribeClick(param => {
        if (!param.time || param.point.x < 0 || param.point.x > container.clientWidth || param.point.y < 0 || param.point.y > container.clientHeight) {
            tooltip.classList.add('hidden');
            return;
        }

        const dataPoint = currentPriceData.find(d => d.time === param.time);
        if (!dataPoint) return;

        const ma7 = param.seriesData.get(ma7Series);
        const ma25 = param.seriesData.get(ma25Series);

        const dateStr = new Date(param.time * 1000).toLocaleString();
        const priceChange = dataPoint.open !== 0 ? ((dataPoint.close - dataPoint.open) / dataPoint.open * 100).toFixed(2) : '0.00';
        const colorClass = parseFloat(priceChange) >= 0 ? 'text-up' : 'text-down';

        tooltip.innerHTML = `
            <div class="font-black text-secondary-text mb-2 border-b border-border/50 pb-2 text-[10px] tracking-tight">${dateStr}</div>
            <div class="space-y-1.5">
                <div class="flex justify-between items-center"><span class="text-secondary-text uppercase font-bold">Open</span> <span class="font-mono text-primary-text">${dataPoint.open.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-secondary-text uppercase font-bold text-up">High</span> <span class="font-mono text-up">${dataPoint.high.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-secondary-text uppercase font-bold text-down">Low</span> <span class="font-mono text-down">${dataPoint.low.toFixed(8)}</span></div>
                <div class="flex justify-between items-center"><span class="text-secondary-text uppercase font-bold">Close</span> <span class="font-mono text-primary-text font-black">${dataPoint.close.toFixed(8)}</span></div>
                <div class="flex justify-between items-center border-t border-border/30 pt-1.5"><span class="text-secondary-text uppercase font-bold">Change</span> <span class="font-mono ${colorClass} font-black">${priceChange}%</span></div>
                <div class="flex justify-between items-center"><span class="text-secondary-text uppercase font-bold">Volume</span> <span class="font-mono text-gray-300">${(dataPoint.volume || 0).toLocaleString()}</span></div>
                <div class="flex justify-between items-center border-t border-border/30 pt-1.5"><span class="text-[#ffeb3b] uppercase font-bold">MA7</span> <span class="font-mono text-[#ffeb3b]">${ma7 ? ma7.value.toFixed(8) : '-'}</span></div>
                <div class="flex justify-between items-center"><span class="text-[#9c27b0] uppercase font-bold">MA25</span> <span class="font-mono text-[#9c27b0]">${ma25 ? ma25.value.toFixed(8) : '-'}</span></div>
            </div>
        `;
        tooltip.classList.remove('hidden');
        const x = Math.min(param.point.x + 15, container.clientWidth - 190);
        const y = Math.min(param.point.y + 15, container.clientHeight - 180);

        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
    });

    window.addEventListener('resize', () => {
        const wrapper = document.getElementById('chartWrapper');
        if (wrapper && lightweightChart) {
            lightweightChart.applyOptions({ width: wrapper.clientWidth, height: wrapper.clientHeight });
        }
    });
};

export const calculateMA = function(data, period) {
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

export const toggleMA = function(period) {
    const series = period === 7 ? ma7Series : ma25Series;
    const btn = document.getElementById(period === 7 ? 'toggleMA7' : 'toggleMA25');
    if (!series) return;
    const isVisible = series.options().visible;
    series.applyOptions({ visible: !isVisible });
    if (btn) {
        btn.classList.toggle('bg-up/20', !isVisible);
        btn.classList.toggle('text-up', !isVisible);
        btn.classList.toggle('border-up/30', !isVisible);
        btn.classList.toggle('text-secondary-text', isVisible);
    }
    localStorage.setItem(period === 7 ? 'ma7Visible' : 'ma25Visible', !isVisible);
};

export const setTimeframe = function(timeframe, btn) {
    if (!window.currentPRC20) return;

    currentTimeframe = timeframe;
    localStorage.setItem('chartTimeframe', timeframe);

    document.querySelectorAll('.tf-btn').forEach(b => {
        b.classList.remove('bg-up', 'text-bg');
        b.classList.add('bg-card');
    });

    if (btn) {
        btn.classList.remove('bg-card');
        btn.classList.add('bg-up', 'text-bg');
    }

    loadPriceHistory(window.currentPRC20, timeframe);
};

export const loadPriceHistory = async function(contractAddress, timeframe) {
    const statusEl = document.getElementById('chartStatus');
    setText(statusEl, 'Updating...');
    currentTimeframe = timeframe;

    if (timeframe === 'realtime') {
        try {
            const data = await window.fetchDirect(`${APP_CONFIG.BACKEND_API}/api/token-price?address=${contractAddress}&timeframe=realtime&_t=${Date.now()}`, { cache: 'no-store' });

            if (!data.history || !data.history.length) {
                setText(statusEl, 'No real-time data');
                return;
            }

            const candles = data.history.map(item => ({
                time: Math.floor(item.timestamp / 1000),
                open: parseFloat(item.price_paxi),
                high: parseFloat(item.price_paxi),
                low: parseFloat(item.price_paxi),
                close: parseFloat(item.price_paxi),
                value: parseFloat(item.price_paxi),
                volume: Math.floor(Math.random() * 500)
            }));

            currentPriceData = candles;
            lineSeries.setData(candles);
            ma7Series.setData(calculateMA(candles, 7));
            ma25Series.setData(calculateMA(candles, 25));
            lightweightChart.timeScale().fitContent();

            const lastPrice = candles[candles.length - 1].close;
            setText('currentPrice', lastPrice.toFixed(8) + ' PAXI');

            const change = data.price_change !== undefined ? data.price_change * 100 : 0;
            const changeEl = document.getElementById('priceChange');
            if (changeEl) {
                changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                changeEl.className = `text-[10px] font-bold ${change >= 0 ? 'text-up' : 'text-down'}`;
            }

            setText(statusEl, 'Live • WebSocket Active');
        } catch (e) {
            console.error('Real-time fetch error:', e);
            setText(statusEl, 'Error');
        }
        return;
    }

    const BUCKET_SIZES = { '1h': 60, '24h': 900, '7d': 7200, '30d': 43200 };
    const bucketSize = BUCKET_SIZES[timeframe] || 3600;

    try {
        const url = `${APP_CONFIG.BACKEND_API}/api/token-price?address=${contractAddress}&timeframe=${timeframe}&_t=${Date.now()}`;
        const data = await window.fetchDirect(url, { cache: 'no-store' });
        if (!data.history || !data.history.length) { setText(statusEl, 'No history'); return; }

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
                currentBucket = { time: bTime, open: p.price, high: p.price, low: p.price, close: p.price, value: p.price, volume: 0 };
            } else {
                currentBucket.high = Math.max(currentBucket.high, p.price);
                currentBucket.low = Math.min(currentBucket.low, p.price);
                currentBucket.close = p.price;
                currentBucket.value = p.price;
            }
        });
        if (currentBucket) candles.push(currentBucket);

        candles.forEach((c, idx) => {
            const prev = candles[idx-1] || c;
            c.volume = Math.floor(Math.abs(c.close - prev.close) * 1000000 + Math.random() * 500);
        });

        currentPriceData = candles;
        lineSeries.setData(candles);
        ma7Series.setData(calculateMA(candles, 7));
        ma25Series.setData(calculateMA(candles, 25));
        lightweightChart.timeScale().fitContent();

        const last = candles[candles.length - 1];
        if (last) {
            setText('currentPrice', last.close.toFixed(8) + ' PAXI');
            const change = candles[0].open !== 0 ? ((last.close - candles[0].open) / candles[0].open * 100) : 0;
            const changeEl = document.getElementById('priceChange');
            if (changeEl) {
                changeEl.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
                changeEl.className = `text-[10px] font-bold ${change >= 0 ? 'text-up' : 'text-down'}`;
            }
        }
        setText(statusEl, `Live • ${timeframe}`);

        startRealtimeUpdates();
    } catch (e) { setText(statusEl, 'Error'); }
};

export let chartUpdateInterval = null;

export const startRealtimeUpdates = function() {
    if (countdownInterval) clearInterval(countdownInterval);
    if (chartUpdateInterval) clearInterval(chartUpdateInterval);

    if (currentTimeframe === 'realtime') {
        const statusEl = document.getElementById('chartStatus');
        if (statusEl) setText(statusEl, 'Live • WebSocket Active');
    } else {
        chartUpdateInterval = setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            if (window.currentPRC20) loadPriceHistory(window.currentPRC20, currentTimeframe);
        }, 60000);
    }
};

window.initChart = initChart;
window.loadPriceHistory = loadPriceHistory;
window.startRealtimeUpdates = startRealtimeUpdates;
