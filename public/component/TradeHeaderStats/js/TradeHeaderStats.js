window.UIManager.registerUI('TradeHeaderStats', () => {
    return `
        <div class="bg-secondary border-y border-secondary px-3 py-2 mb-3 z-30">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                    <div id="tokenLogo" class="w-10 h-10 bg-secondary border border-secondary shadow-brutal-sm flex items-center justify-center rotate-[-3deg]">
                        <i class="fas fa-coins text-black text-lg"></i>
                    </div>
                    <div>
                        <h2 id="selectedPair" class="text-xl font-display text-primary-text italic leading-none mb-0.5 uppercase tracking-tight">SELECT TOKEN</h2>
                        <div class="flex items-center gap-2">
                            <span id="currentPrice" class="text-[11px] font-mono font-bold text-accent">0.000000 PAXI</span>
                            <span id="priceChange" class="text-[9px] font-sans text-soft-success bg-primary px-1 border border-secondary">-0.00%</span>
                        </div>
                    </div>
                    <button id="aiBtn" class="bg-accent text-black font-display text-base px-2 py-0.5 border border-secondary shadow-brutal-sm hover:shadow-none transition-all uppercase italic">
                        <i class="fas fa-brain text-[10px]"></i> AI
                    </button>
                </div>

                <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 w-full lg:w-auto">
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Mcap</div>
                        <div id="mcapVal" class="text-[8px] font-mono font-bold text-primary-text uppercase truncate">0 PAXI</div>
                    </div>
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Liq</div>
                        <div id="liqVal" class="text-[8px] font-mono font-bold text-accent uppercase truncate">0 PAXI</div>
                    </div>
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">High</div>
                        <div id="high24h" class="text-[8px] font-mono font-bold text-soft-success truncate">0.00</div>
                    </div>
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Low</div>
                        <div id="low24h" class="text-[8px] font-mono font-bold text-soft-failed truncate">0.00</div>
                    </div>
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Vol</div>
                        <div id="volVal" class="text-[8px] font-mono font-bold text-soft-warning uppercase truncate">0 PAXI</div>
                    </div>
                    <div class="bg-primary p-1 border border-secondary overflow-hidden">
                        <div class="text-[6px] text-muted-text uppercase font-bold font-mono truncate">Signal</div>
                        <div id="tradeSignal" class="text-[8px] font-display uppercase text-primary-text truncate">Neutral</div>
                    </div>
                </div>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('TradeHeaderStats', (container) => {
    container.querySelector('#aiBtn')?.addEventListener('click', () => window.showAIAnalysis());
});

window.updateDashboard = function(detail) {
    if (!detail) return;
    const address = window.currentPRC20;
    window.setText('selectedPair', `${detail.symbol}/PAXI`);
    window.setText('currentPrice', window.formatPrice(detail.price_paxi) + ' PAXI');
    const changeEl = document.getElementById('priceChange');
    if (changeEl) {
        const rawChange = detail.price_change_24h || 0; const valNum = rawChange * 100; const valText = (valNum >= 0 ? '+' : '') + valNum.toFixed(2) + '%';
        if (changeEl.textContent !== valText) {
            window.setText(changeEl, valText); changeEl.classList.remove('bg-soft-success', 'bg-soft-failed', 'text-black', 'text-primary-text', 'bg-primary');
            if (valNum >= 0) changeEl.classList.add('bg-soft-success', 'text-black'); else changeEl.classList.add('bg-soft-failed', 'text-primary-text');
        }
    }
    window.setText('mcapVal', window.formatAmount(detail.market_cap) + ' PAXI');
    window.setText('liqVal', window.formatAmount(detail.liquidity) + ' PAXI');
    window.setText('volVal', window.formatAmount(detail.volume_24h) + ' PAXI');
    const high = detail.high_24h > 0 ? detail.high_24h : detail.price_paxi; const low = detail.low_24h > 0 ? detail.low_24h : detail.price_paxi;
    window.setText('high24h', window.formatPrice(high)); window.setText('low24h', window.formatPrice(low));
    const signalEl = document.getElementById('tradeSignal');
    if (signalEl) {
        const change = detail.price_change_24h;
        if (change >= 0.05) { window.setText(signalEl, 'GIGA BULL'); signalEl.className = 'font-display text-[9px] uppercase italic text-meme-green font-bold'; }
        else if (change > 0) { window.setText(signalEl, 'MOONING'); signalEl.className = 'font-display text-[9px] uppercase italic text-meme-green opacity-70 font-bold'; }
        else if (change <= -0.05) { window.setText(signalEl, 'TOTAL REKT'); signalEl.className = 'font-display text-[9px] uppercase italic text-meme-pink font-bold'; }
        else if (change < 0) { window.setText(signalEl, 'BLEEDING'); signalEl.className = 'font-display text-[9px] uppercase italic text-meme-pink opacity-70 font-bold'; }
        else { window.setText(signalEl, 'STAGNANT'); signalEl.className = 'font-display text-[9px] uppercase italic text-secondary-text font-bold'; }
    }
    window.setText('buyCount', detail.buys.toLocaleString()); window.setText('sellCount', detail.sells.toLocaleString()); window.setText('txCount', detail.txs_count.toLocaleString());
    const totalTrade = detail.buys + detail.sells; const buyRatio = totalTrade > 0 ? Math.round((detail.buys / totalTrade) * 100) : 50;
    const bar = document.getElementById('buyRatioBar'); if (bar) { bar.style.width = `${buyRatio}%`; bar.className = `h-full bg-meme-green transition-all duration-500`; }
    window.setText('resPaxi', window.formatAmount(detail.reserve_paxi / 1000000, 2));
    window.setText('resToken', window.formatAmount(detail.reserve_prc20 / Math.pow(10, detail.decimals), 2));
    window.setText('resTokenLabel', detail.symbol + ' STOCK'); window.setText('holderCount', detail.holders.toLocaleString());
    window.setText('caAddr', address); window.setText('totalSupply', window.formatAmount(detail.total_supply_num, 0));
    const minter = document.getElementById('minterStatus'); if (minter) { window.setText(minter, detail.minting_disabled ? 'Freezing and minting have been revoked' : 'Freezing and minting have not been revoked'); minter.className = detail.minting_disabled ? 'font-display text-base text-meme-green uppercase italic tracking-tighter' : 'font-display text-base text-meme-pink uppercase italic tracking-tighter'; }
    const verif = document.getElementById('verifyStatus'); if (verif) { window.setText(verif, detail.official_verified ? 'OFFICIAL VERIFIED' : 'NOT VERIFIED'); verif.className = detail.official_verified ? 'font-display text-base text-meme-cyan uppercase italic tracking-tighter' : 'font-display text-base text-muted-text uppercase italic tracking-tighter'; }
    const descCard = document.getElementById('tokenDetailsCard'); if (descCard) { descCard.classList.remove('hidden'); window.setText('tokenDesc', detail.description || 'NO DESCRIPTION AVAILABLE.'); window.setText('mktAddr', detail.marketing_wallet || 'N/A'); }
    const logoEl = document.getElementById('tokenLogo'); if (logoEl) { if (detail.logo) window.setHtml(logoEl, `<img src="${detail.logo}" class="w-full h-full object-cover">`); else window.setHtml(logoEl, `<span class="text-black font-display text-3xl">${detail.symbol.charAt(0)}</span>`); }
    const socials = document.getElementById('socialLinks'); if (socials) { socials.innerHTML = ''; if (detail.website) socials.innerHTML += `<a href="${detail.website}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-primary-text hover:text-meme-green shadow-brutal hover:shadow-none transition-all"><i class="fas fa-globe"></i></a>`; if (detail.project) socials.innerHTML += `<a href="${detail.project}" target="_blank" class="w-10 h-10 flex items-center justify-center bg-surface border-2 border-card text-primary-text hover:text-meme-cyan shadow-brutal hover:shadow-none transition-all"><i class="fab fa-twitter"></i></a>`; }
    window.setText('recvTokenSymbol', detail.symbol); if (window.updateTradeBalances) window.updateTradeBalances();
};
