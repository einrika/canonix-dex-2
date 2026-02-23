import { normalizeLogoUrl, formatAmount, escapeHtml, copyAddress, shareToken } from '../core/utils.js';

export const TokenModalLogic = (container) => {
    // Logic handled by global window.showTokenDetail
};

export const showTokenDetail = async function(event, address) {
    if (event) event.stopPropagation();

    const modal = document.getElementById('tokenDetailModal');
    const content = document.getElementById('tokenDetailContent');
    if (!modal || !content) return;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');

    content.innerHTML = `<div class="p-20 text-center"><div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div>`;

    const detail = window.tokenDetails.get(address) || await window.loadTokenDetail(address);
    if (!detail) {
        content.innerHTML = `<div class="p-10 text-center text-meme-pink font-display text-2xl uppercase italic">ACCESS DENIED: DATA CORRUPTED</div>`;
        return;
    }

    const logo = normalizeLogoUrl(detail.logo);

    content.innerHTML = `
        <div class="relative">
            <div class="h-32 bg-card relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-secondary/80"></div>
                <button onclick="window.hideTokenDetail()" class="absolute top-4 right-4 w-10 h-10 bg-bg border-2 border-card flex items-center justify-center text-primary-text hover:text-meme-pink z-20 shadow-brutal-sm"><i class="fas fa-times"></i></button>
            </div>

            <div class="px-8 pb-10 -mt-12 relative z-10">
                <div class="flex flex-col md:flex-row gap-6 items-start">
                    <div class="w-32 h-32 bg-bg border-4 border-card shadow-brutal flex-shrink-0 overflow-hidden">
                        ${logo ? `<img src="${logo}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-4xl font-display italic">${detail.symbol?.[0] || '?'}</div>`}
                    </div>

                    <div class="flex-1 pt-12 md:pt-14 min-w-0">
                        <div class="flex items-center gap-3 mb-1">
                            <h2 class="text-4xl md:text-5xl font-display text-primary-text italic leading-none truncate uppercase tracking-tighter">${escapeHtml(detail.name)}</h2>
                            ${detail.verified ? `<i class="fas fa-check-circle text-meme-cyan text-2xl" title="Verified Project"></i>` : ''}
                        </div>
                        <p class="font-display text-2xl text-meme-green italic uppercase tracking-widest">${detail.symbol}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
                    <div class="bg-bg border-2 border-card p-4 shadow-brutal-sm">
                        <p class="font-mono text-[8px] text-muted-text uppercase font-black tracking-widest mb-1">MARKET CAP</p>
                        <p class="font-display text-xl text-primary-text italic">$${formatAmount(detail.market_cap_usd)}</p>
                    </div>
                    <div class="bg-bg border-2 border-card p-4 shadow-brutal-sm">
                        <p class="font-mono text-[8px] text-muted-text uppercase font-black tracking-widest mb-1">LIQUIDITY</p>
                        <p class="font-display text-xl text-primary-text italic">$${formatAmount(detail.liquidity_usd)}</p>
                    </div>
                    <div class="bg-bg border-2 border-card p-4 shadow-brutal-sm">
                        <p class="font-mono text-[8px] text-muted-text uppercase font-black tracking-widest mb-1">HOLDERS</p>
                        <p class="font-display text-xl text-primary-text italic">${detail.holders}</p>
                    </div>
                    <div class="bg-bg border-2 border-card p-4 shadow-brutal-sm">
                        <p class="font-mono text-[8px] text-muted-text uppercase font-black tracking-widest mb-1">24H VOL</p>
                        <p class="font-display text-xl text-primary-text italic">${formatAmount(detail.volume_24h)} PAXI</p>
                    </div>
                </div>

                <div class="mt-8 space-y-6">
                    <div class="bg-bg border-2 border-card p-6">
                        <p class="font-mono text-[10px] text-muted-text uppercase font-black tracking-widest mb-3 border-b-2 border-card pb-2">CONTRACT PROTOCOL</p>
                        <div class="flex items-center justify-between bg-card p-3 border-2 border-card group">
                            <span class="font-mono text-[10px] text-primary-text truncate mr-4">${detail.address}</span>
                            <div class="flex gap-2">
                                <button onclick="window.copyAddress(event, '${detail.address}')" class="w-8 h-8 bg-bg border-2 border-card flex items-center justify-center text-muted-text hover:text-meme-cyan shadow-brutal-sm hover:shadow-none transition-all"><i class="far fa-copy"></i></button>
                                <a href="https://explorer.paxinet.io/contract/${detail.address}" target="_blank" class="w-8 h-8 bg-bg border-2 border-card flex items-center justify-center text-muted-text hover:text-meme-yellow shadow-brutal-sm hover:shadow-none transition-all"><i class="fas fa-external-link-alt"></i></a>
                            </div>
                        </div>
                    </div>

                    ${detail.description ? `
                    <div class="bg-bg border-2 border-card p-6">
                        <p class="font-mono text-[10px] text-muted-text uppercase font-black tracking-widest mb-3 border-b-2 border-card pb-2">INTEL DATA</p>
                        <p class="font-sans text-sm text-secondary-text leading-relaxed italic uppercase font-bold">${escapeHtml(detail.description)}</p>
                    </div>` : ''}
                </div>

                <div class="flex flex-col sm:flex-row gap-4 mt-10">
                    <button onclick="window.selectPRC20('${detail.address}'); window.hideTokenDetail();" class="flex-1 py-4 bg-meme-green text-black font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">PUMP THIS TOKEN</button>
                    <button onclick="window.shareToken('${detail.address}')" class="px-8 py-4 bg-bg text-primary-text font-display text-2xl border-4 border-card shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic"><i class="fas fa-share-alt mr-2"></i></button>
                </div>
            </div>
        </div>
    `;
};

export const hideTokenDetail = function() {
    const modal = document.getElementById('tokenDetailModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
};

window.showTokenDetail = showTokenDetail;
window.hideTokenDetail = hideTokenDetail;
