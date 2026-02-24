// ============================================
// CHART.JS - Price Chart Management
// ============================================

import { State } from '../../core/state.js';
import { APP_CONFIG } from '../../core/config.js';
import { fetchDirect, setText } from '../../core/utils.js';

export const ChartModule = {
    state: {
        lightweightChart: null,
        lineSeries: null,
        ma7Series: null,
        ma25Series: null,
        currentPriceData: [],
        currentTimeframe: localStorage.getItem('chartTimeframe') || '24h',
        refreshCountdown: 10,
        intervals: []
    },

    init: function(container) {
        if (!container || !window.LightweightCharts) return;

        const chartOptions = {
            layout: { background: { color: 'transparent' }, textColor: '#9ca3af' },
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.05)' }
            },
            rightPriceScale: { borderColor: 'rgba(255, 255, 255, 0.1)', precision: 8, autoScale: true },
            timeScale: { borderColor: 'rgba(255, 255, 255, 0.1)', timeVisible: true }
        };

        this.state.lightweightChart = window.LightweightCharts.createChart(container, chartOptions);
        this.state.lineSeries = this.state.lightweightChart.addLineSeries({ color: '#00f2fe', lineWidth: 3 });
        this.state.ma7Series = this.state.lightweightChart.addLineSeries({ color: '#ffeb3b', lineWidth: 1.5, visible: false });
        this.state.ma25Series = this.state.lightweightChart.addLineSeries({ color: '#9c27b0', lineWidth: 1.5, visible: false });

        window.addEventListener('resize', () => {
            if (this.state.lightweightChart) {
                this.state.lightweightChart.applyOptions({ width: container.clientWidth, height: container.clientHeight });
            }
        });

        this.loadPriceHistory();
    },

    loadPriceHistory: async function() {
        const token = State.get('currentToken');
        if (!token) return;

        try {
            const timeframe = this.state.currentTimeframe;
            const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/token-price?address=${token.address}&timeframe=${timeframe}`);

            if (data?.history) {
                const candles = data.history.map(item => ({
                    time: Math.floor(new Date(item.timestamp).getTime() / 1000),
                    value: parseFloat(item.price_paxi)
                }));
                this.state.lineSeries.setData(candles);
                this.state.lightweightChart.timeScale().fitContent();
            }
        } catch (e) {
            console.error("Chart load failed", e);
        }
    }
};
