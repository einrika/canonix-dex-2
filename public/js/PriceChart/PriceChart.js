// ============================================
// PRICE CHART LOGIC
// ============================================

import { State } from '../core/state.js';
import { ChartModule } from '../modules/analytics/chart.js';

export const PriceChartLogic = (container) => {
    const chartContainer = container.querySelector('#priceChart');
    if (chartContainer) {
        ChartModule.init(chartContainer);
    }

    container.querySelectorAll('.tf-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ChartModule.state.currentTimeframe = btn.dataset.tf;
            ChartModule.loadPriceHistory();

            container.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('bg-meme-green', 'text-black'));
            btn.classList.add('bg-meme-green', 'text-black');
        });
    });

    State.subscribe('currentToken', () => {
        ChartModule.loadPriceHistory();
    });
};
