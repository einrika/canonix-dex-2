// ============================================
// TOKEN-INFO.JS - Token Card & Detail Modal
// ============================================

// ===== UPDATE TOKEN CARD (LEGACY WRAPPER) =====
window.updateTokenCard = function(address) {
    const el = window.tokenElementMap.get(address) || document.querySelector(\`[data-token="\${address}"]\`);
    if (el) window.patchTokenElement(el, address);
};

// ===== SHOW TOKEN DETAIL MODAL =====
window.showTokenDetail = function(event, address) {
    event.stopPropagation();
    const detail = window.tokenDetails.get(address);
    if (!detail) {  return; }
    const totalSupply = detail.total_supply ? (parseInt(detail.total_supply) / Math.pow(10, detail.decimals)).toLocaleString() : 'N/A';
    const safeName = window.escapeHtml(detail.name); const safeSymbol = window.escapeHtml(detail.symbol);
    const safeDescription = window.escapeHtml(detail.description); const safeProject = window.escapeHtml(detail.project);
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-surface bg-opacity-80 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = \`
        <div class="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div class="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                <h3 class="text-lg font-bold">Token Details</h3>
                <div class="flex gap-2">
                    <button onclick="window.shareToken('\${address}')" class="text-secondary-text hover:text-primary-text px-2"><i class="fas fa-share-alt"></i></button>
                    <button onclick="this.closest('.fixed').remove()" class="text-secondary-text hover:text-primary-text"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <div class="flex items-center gap-4 mb-6">
                    \${detail.logo ? \`<img src="\${detail.logo}" class="w-20 h-20 rounded-full border border-border" alt="\${safeName}">\` : \`<div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-primary-text font-bold text-3xl">\${safeSymbol.charAt(0)}</div>\`}
                    <div><h2 class="text-2xl font-bold">\${safeName}</h2><span class="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-sm font-mono">\${safeSymbol}</span>\${detail.verified ? '<i class="fas fa-check-circle text-blue-400 text-sm ml-2"></i>' : ''}</div>
                </div>
                \${detail.description ? \`<div class="bg-bg rounded-xl p-4 border border-border"><h4 class="text-xs font-bold text-secondary-text uppercase mb-2">Description</h4><p class="text-sm text-gray-300">\textDescription}</p></div>\` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-secondary-text uppercase">Token Info</h4>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Supply</span><span class="font-bold">\${totalSupply}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Decimals</span><span class="font-bold">\${detail.decimals}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Holders</span><span class="font-bold">\${detail.holders.toLocaleString()}</span></div>
                    </div>
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-secondary-text uppercase">Market Data</h4>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Price</span><span class="font-bold text-up">$\${window.formatPrice(detail.price_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">MCap</span><span class="font-bold">$\${window.formatAmount(detail.market_cap_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Liquidity</span><span class="font-bold text-blue-400">$\${window.formatAmount(detail.liquidity_usd)}</span></div>
                    </div>
                </div>
                <div class="bg-bg rounded-xl p-4 border border-border">
                    <h4 class="text-xs font-bold text-secondary-text uppercase mb-2">Contract Address</h4>
                    <div class="flex items-center gap-2"><code class="text-xs text-secondary-text font-mono flex-1">\${window.shortenAddress(address, 12)}</code><button onclick="window.copyAddress(event, '\${address}')" class="px-3 py-1 bg-card border border-border rounded text-[10px] font-bold hover:text-up transition-all">COPY</button></div>
                </div>
                <button onclick="window.selectPRC20('\${address}'); this.closest('.fixed').remove();" class="w-full py-4 btn-trade rounded-xl font-black text-sm uppercase tracking-widest shadow-brutal-sm">Swap This Token</button>
            </div>
        </div>\`;
    document.body.appendChild(modal);
};