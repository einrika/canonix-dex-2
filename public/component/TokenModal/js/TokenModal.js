window.UIManager.registerUI('TokenModal', () => {
    return `
        <div id="tokenModal" class="hidden fixed inset-0 bg-primary/95 z-[333] flex items-center justify-center p-4">
            <div class="bg-secondary border border-secondary shadow-minimal w-full max-w-md max-h-[70vh] overflow-hidden flex flex-col">
                <div class="p-3 border-b border-secondary flex justify-between items-center bg-accent">
                    <h3 class="text-xl font-display text-black uppercase tracking-tight">Select Token</h3>
                    <button id="close-token-modal" class="text-black hover:rotate-90 transition-transform">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="p-3 bg-primary border-b border-secondary">
                    <input type="text" id="tokenSearch" placeholder="SEARCH..." class="w-full px-3 py-2 bg-secondary border border-secondary text-primary-text font-sans text-sm outline-none focus:border-accent placeholder:text-muted-text uppercase">
                </div>
                <div id="tokenList" class="flex-1 overflow-y-auto no-scrollbar bg-bg"></div>
            </div>
        </div>
    `;
});

window.UIManager.registerLogic('TokenModal', (container) => {
    container.querySelector('#close-token-modal')?.addEventListener('click', () => window.hideTokenSelector());
    container.querySelector('#tokenSearch')?.addEventListener('input', () => window.filterTokens());
});

window.showTokenSelector = function() {
    window.removeClass('tokenModal', 'hidden');
    window.addClass('tokenModal', 'flex');
    window.renderTokenList();
};

window.hideTokenSelector = function() {
    window.addClass('tokenModal', 'hidden');
    window.removeClass('tokenModal', 'flex');
};

window.filterTokens = function() {
    window.renderTokenList(document.getElementById('tokenSearch')?.value);
};

window.renderTokenList = function(filter = '') {
    const container = document.getElementById('tokenList');
    if (!container) return;
    const filtered = window.tokenAddresses.filter(addr => {
        const detail = window.tokenDetails.get(addr);
        const lowerFilter = filter.toLowerCase();
        return addr.toLowerCase().includes(lowerFilter) || (detail && (detail.name.toLowerCase().includes(lowerFilter) || detail.symbol.toLowerCase().includes(lowerFilter)));
    });
    if (filtered.length === 0) { container.innerHTML = '<div class="text-center font-display text-2xl text-muted-text py-12 uppercase italic">No Trash Detected</div>'; return; }
    container.innerHTML = filtered.map(addr => {
        const detail = window.tokenDetails.get(addr); const shortAddr = addr.slice(0, 8) + '...' + addr.slice(-6);
        if (!detail) return `<div class="p-6 border-b-2 border-card flex items-center gap-6 hover:bg-surface cursor-pointer group transition-colors" onclick="window.selectPRC20('${addr}')"><div class="w-14 h-14 bg-card border-4 border-card shadow-brutal flex items-center justify-center font-display text-2xl text-muted-text rotate-[-5deg]">?</div><div class="flex-1 min-w-0"><div class="font-mono text-xs text-secondary-text font-bold truncate uppercase">${addr}</div><div class="font-display text-lg text-muted-text italic uppercase">SYNCING...</div></div><i class="fas fa-chevron-right text-muted-text"></i></div>`;
        return `
            <div class="p-6 border-b-2 border-card flex items-center gap-6 hover:bg-surface cursor-pointer group transition-colors" onclick="window.selectPRC20('${addr}')">
                <div class="relative rotate-[-5deg] group-hover:rotate-0 transition-transform">
                    <div class="w-16 h-16 bg-card border-4 border-card shadow-brutal flex items-center justify-center font-display text-3xl overflow-hidden">
                        ${detail.logo ? `<img src="${detail.logo}" class="w-full h-full object-cover">` : `<span>${detail.symbol.charAt(0)}</span>`}
                    </div>
                    ${detail.verified ? `<div class="absolute -bottom-2 -right-2 w-6 h-6 bg-meme-green border-2 border-card flex items-center justify-center text-black text-[10px]"><i class="fas fa-check"></i></div>` : ''}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3 mb-1">
                        <span class="font-display text-2xl text-primary-text italic uppercase tracking-tighter">${detail.name}</span>
                        <span class="px-2 py-0.5 bg-surface border border-card text-meme-cyan font-mono text-[9px] font-bold uppercase">${detail.symbol}</span>
                    </div>
                    <div class="flex items-center gap-4">
                        <code class="font-mono text-[10px] text-muted-text uppercase font-bold truncate">${shortAddr}</code>
                        <div class="flex gap-2">
                            <button onclick="window.copyAddress(event, '${addr}')" class="text-meme-yellow hover:scale-125 transition-transform"><i class="fas fa-copy"></i></button>
                            <button onclick="window.showTokenDetail(event, '${addr}')" class="text-meme-cyan hover:scale-125 transition-transform"><i class="fas fa-info-circle"></i></button>
                        </div>
                    </div>
                </div>
                <i class="fas fa-chevron-right text-muted-text group-hover:translate-x-2 transition-transform"></i>
            </div>`;
    }).join('');
};
