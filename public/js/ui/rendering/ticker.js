// ============================================
// TICKER.JS - Ticker News Logic
// ============================================

window.updateTicker = function() {
    const tickerContainer = document.getElementById('tickerContent');
    if (!tickerContainer) return;
    const tokens = [...window.tokenDetails.values()];
    if (tokens.length === 0) return;

    const gainers = [...tokens].sort((a, b) => b.price_change_24h - a.price_change_24h).slice(0, 5);
    const hot = [...tokens].sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 5);

    const itemClass = "inline-block text-black font-display text-[10px] md:text-sm mx-4 md:mx-8 italic uppercase tracking-tighter";
    const spanClass = "text-meme-surface bg-surface/10 px-1 ml-1 font-mono font-bold";

    let html = '';
    // Double content to ensure marquee loop is smooth
    const items = [];
    gainers.forEach(t => {
        items.push(`<div class="${itemClass}">GAINER: ${t.symbol} <span class="${spanClass}">+${(t.price_change_24h * 100).toFixed(2)}%</span></div>`);
    });
    hot.forEach(t => {
        items.push(`<div class="${itemClass}">HOT: ${t.symbol} <span class="${spanClass}">Vol ${window.formatAmount(t.volume_24h)}</span></div>`);
    });

    const finalItems = [...items, ...items]; // Repeat for marquee
    window.setHtml(tickerContainer, finalItems.join(''));
};