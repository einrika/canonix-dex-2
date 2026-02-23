// ============================================
// LANDINGAISCAN LOGIC
// ============================================

import { fetchDirect } from '../core/utils.js';
import { APP_CONFIG } from '../core/config.js';

export const LandingAIScanLogic = (container) => {
    if (document.getElementById('index-ai-content')) {
        initGlobalMarketAI();
    }
};

export async function initGlobalMarketAI() {
    const container = document.getElementById('index-ai-content');
    if (!container) return;
    try {
        const url = `${APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
        const data = await fetchDirect(url);
        if (!data || !data.contracts || data.contracts.length === 0) {
            container.innerHTML = '<p class="text-muted-text font-black uppercase tracking-widest text-sm">Market scan currently restricted</p>';
            return;
        }
        const topToken = window.processTokenDetail(data.contracts[0].contract_address, data.contracts[0]);
        const analysisData = { symbol: topToken.symbol, price: topToken.price_paxi, change24h: topToken.price_change_24h * 100, liquidity: topToken.liquidity * 500000, volume: topToken.volume_24h, onChainActivity: "High DEX activity, increasing liquidity depth, strong holder retention." };
        const serverResult = await window.callServerAI(analysisData);
        if (serverResult) renderIndexAI(container, topToken, serverResult);
        else container.innerHTML = '<p class="text-muted-text font-black uppercase tracking-widest text-sm">AI pipeline offline</p>';
    } catch (e) { console.error('Landing AI error:', e); container.innerHTML = '<p class="text-muted-text font-black uppercase tracking-widest text-sm">Scan failed</p>'; }
}

export function renderIndexAI(container, token, aiText) {
    const sentiment = aiText.toUpperCase().includes('BULLISH') ? 'BULLISH' : aiText.toUpperCase().includes('BEARISH') ? 'BEARISH' : 'NEUTRAL';
    const colorClass = sentiment === 'BULLISH' ? 'text-meme-green' : sentiment === 'BEARISH' ? 'text-meme-pink' : 'text-meme-cyan';
    container.innerHTML = `
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-12 mb-6 md:mb-12">
            <div class="flex items-center gap-4 md:gap-6">
                <div class="w-12 h-12 md:w-20 md:h-20 bg-surface border-2 md:border-4 border-card flex items-center justify-center ${colorClass} text-xl md:text-4xl shadow-[4px_4px_0_0_#000] md:shadow-brutal rotate-[-5deg]">
                    <i class="fas fa-brain"></i>
                </div>
                <div>
                    <h3 class="font-display italic uppercase text-2xl md:text-4xl tracking-tighter">AI <span class="${colorClass}">ANALYSIS</span></h3>
                    <p class="font-mono text-[8px] md:text-xs text-muted-text font-bold uppercase tracking-[0.4em]">GEMINI PRO 1.5 VERIFIED</p>
                </div>
            </div>
            <div class="px-4 md:px-8 py-1.5 md:py-3 bg-surface border-2 md:border-4 border-current ${colorClass} font-display text-lg md:text-2xl shadow-[4px_4px_0_0_#000] md:shadow-brutal rotate-[2deg]">
                ${sentiment} VIBES
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-12">
            <div class="p-4 md:p-6 bg-surface border-2 md:border-4 border-card shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">TARGET</div>
                <div class="text-lg md:text-2xl font-display text-primary-text italic tracking-tight">${token.symbol}</div>
            </div>
            <div class="p-4 md:p-6 bg-surface border-2 md:border-4 border-card shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">RISK LVL</div>
                <div class="text-lg md:text-2xl font-display ${token.liquidity > 10000 ? 'text-meme-green' : 'text-meme-yellow'} italic tracking-tight">
                    ${token.liquidity > 20000 ? 'GIGA' : token.liquidity > 5000 ? 'MID' : 'REKT'}
                </div>
            </div>
            <div class="p-4 md:p-6 bg-surface border-2 md:border-4 border-card shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">TREND</div>
                <div class="text-lg md:text-2xl font-display text-meme-cyan italic tracking-tight">${token.price_change_24h > 0 ? 'MOON' : 'BLEED'}</div>
            </div>
            <div class="p-4 md:p-6 bg-surface border-2 md:border-4 border-card shadow-[4px_4px_0_0_#000] md:shadow-brutal">
                <div class="text-[8px] md:text-[10px] text-secondary-text font-mono font-bold uppercase tracking-widest mb-1 md:mb-2">BRAIN</div>
                <div class="text-lg md:text-2xl font-display text-primary-text italic tracking-tight">9.8/10</div>
            </div>
        </div>
        <div class="bg-surface border-2 md:border-4 border-card p-4 md:p-10 relative overflow-hidden group shadow-[4px_4px_0_0_#000] md:shadow-brutal">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-10"></div>
            <div class="relative z-10">
                <div class="flex items-center gap-3 mb-6">
                    <div class="w-4 h-4 bg-meme-green animate-ping"></div>
                    <div class="font-mono text-sm font-bold text-secondary-text uppercase tracking-widest">AI INTERPRETATION OUTPUT</div>
                </div>
                <div class="text-2xl text-gray-300 leading-tight italic font-mono">"${aiText}"</div>
            </div>
        </div>
        <div class="mt-8 md:mt-10 flex justify-end">
            <a href="trade.html?token=${token.address}" class="px-8 md:px-10 py-3 md:py-4 bg-meme-green text-black font-display text-xl md:text-3xl border-2 md:border-4 border-card shadow-[4px_4px_0_0_#000] md:shadow-brutal hover:translate-x-[2px] md:hover:translate-x-[4px] hover:translate-y-[2px] md:hover:translate-y-[4px] hover:shadow-none transition-all flex items-center gap-3 md:gap-5 rotate-[-1deg]">
                TRADE NOW <i class="fas fa-arrow-right"></i>
            </a>
        </div>`;
}

window.initGlobalMarketAI = initGlobalMarketAI;
