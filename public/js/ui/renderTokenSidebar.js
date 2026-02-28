// ============================================
// RENDERING.JS - Token Card & Sidebar Rendering
// ============================================

// Global DOM Map for partial updates
window.tokenElementMap = new Map();

// ===== RENDER TOKEN SIDEBAR (DYNAMIC) =====
window.currentSubSort = 'all';
window.renderTokenSidebar = function(filter = '', isAppend = false) {
  const container = document.getElementById('tokenSidebarList');
  if (!container) return;

  if (!isAppend && !filter && window.currentSort !== 'nonpump') {
      // If we are not appending and no filter, we might want to reset display limit
      // but let's keep it for now to avoid jumpy UI
      // window.displayLimit = 20;
  }
  
  let filtered = [...window.tokenAddresses];

  // Remove initial loader or any non-managed elements (except subTabs)
  Array.from(container.children).forEach(child => {
      if (child.id !== 'tokenSubTabs' && !child.classList.contains('token-sidebar-item') &&
          child.id !== 'tokenPager' && child.id !== 'tokenEndMarker') {
          child.remove();
      }
  });
  
  // Apply Filters
  if (!filter) {
      switch (window.currentSort) {
        case 'nonpump':
          filtered = filtered.filter(addr => window.tokenDetails.get(addr)?.is_pump === false);
          break;
        case 'verified':
          filtered = filtered.filter(addr => window.tokenDetails.get(addr)?.verified === true);
          break;
      }
  } else {
    const lowerFilter = filter.toLowerCase();
    filtered = filtered.filter(addr => {
      const detail = window.tokenDetails.get(addr);
      return addr.toLowerCase().includes(lowerFilter) ||
        (detail && (detail.name?.toLowerCase().includes(lowerFilter) ||
          detail.symbol?.toLowerCase().includes(lowerFilter)));
    });
  }
  
  // Sort Logic
  filtered.sort((a, b) => {
    const aDetail = window.tokenDetails.get(a);
    const bDetail = window.tokenDetails.get(b);
    if (!aDetail && !bDetail) return 0;
    if (!aDetail) return 1;
    if (!bDetail) return -1;

    const aVer = aDetail.verified ? 1 : 0;
    const bVer = bDetail.verified ? 1 : 0;
    if (aVer !== bVer) return bVer - aVer;

    if (filter) {
        const lowerFilter = filter.toLowerCase();
        const aSym = aDetail.symbol?.toLowerCase() || '';
        const bSym = bDetail.symbol?.toLowerCase() || '';
        if (aSym === lowerFilter && bSym !== lowerFilter) return -1;
        if (bSym === lowerFilter && aSym !== lowerFilter) return 1;
    }

    const aIsPriority = window.APP_CONFIG.PRIORITY_TOKENS.includes(a);
    const bIsPriority = window.APP_CONFIG.PRIORITY_TOKENS.includes(b);
    if (aIsPriority && !bIsPriority) return -1;
    if (!aIsPriority && bIsPriority) return 1;
    
    const sortType = (window.currentSort === 'nonpump' && window.currentSubSort !== 'all') ? window.currentSubSort : window.currentSort;
    switch (sortType) {
      case 'new':
        if (aDetail.id && bDetail.id) return bDetail.id - aDetail.id;
        return new Date(bDetail.created_at) - new Date(aDetail.created_at);
      case 'marketcap':
        return window.numtokenlist(bDetail.market_cap) - window.numtokenlist(aDetail.market_cap);
      case 'gainer':
        return window.numtokenlist(bDetail.price_change_24h) - window.numtokenlist(aDetail.price_change_24h);
      case 'hot':
      default:
        return window.numtokenlist(bDetail.volume_24h) - window.numtokenlist(aDetail.volume_24h);
    }
  });

  // Handle Sub-Tabs for Non-Pump
  let subTabs = document.getElementById('tokenSubTabs');
  if (window.currentSort === 'nonpump') {
      if (!subTabs) {
          subTabs = document.createElement('div');
          subTabs.id = 'tokenSubTabs';
          subTabs.className = 'flex gap-1 p-2 overflow-x-auto no-scrollbar bg-card/50 border-b border-border/50 mb-2 sticky top-0 z-10 backdrop-blur-sm';
          container.prepend(subTabs);
      }
      const subTabsHtml = `
            <button onclick="window.setSubSort('all')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'all' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">ALL NON-PUMP</button>
            <button onclick="window.setSubSort('new')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'new' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">NEW</button>
            <button onclick="window.setSubSort('gainer')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'gainer' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">GAINER</button>
            <button onclick="window.setSubSort('hot')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'hot' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">HOT</button>
            <button onclick="window.setSubSort('marketcap')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'marketcap' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">MCAP</button>
            <button onclick="window.setSubSort('verified')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'verified' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">VERIFIED</button>
      `;
      if (subTabs.innerHTML !== subTabsHtml) subTabs.innerHTML = subTabsHtml;
  } else if (subTabs) {
      subTabs.remove();
  }

  // Handle Empty State
  if (!filtered.length) {
    // Clear everything except subtabs
    Array.from(container.children).forEach(child => {
        if (child.id !== 'tokenSubTabs') child.remove();
    });
    window.tokenElementMap.clear();
    const empty = document.createElement('div');
    empty.className = 'text-center text-secondary-text py-8 empty-state';
    empty.textContent = 'No tokens found';
    container.appendChild(empty);
    return;
  } else {
      const emptyState = container.querySelector('.empty-state');
      if (emptyState) emptyState.remove();
  }

  const displayList = filtered.slice(0, window.displayLimit);
  const targetIds = new Set(displayList);

  // 1. REMOVE tokens no longer in display list
  window.tokenElementMap.forEach((el, id) => {
      if (!targetIds.has(id)) {
          el.remove();
          window.tokenElementMap.delete(id);
      }
  });

  // 2. SYNC/ADD tokens in order
  displayList.forEach((addr, index) => {
      let el = window.tokenElementMap.get(addr);

      if (!el) {
          // CREATE NEW
          el = window.createTokenElement(addr);
          window.tokenElementMap.set(addr, el);
      }

      // PATCH DATA
      window.patchTokenElement(el, addr);

      // ENSURE POSITION (Reorder if necessary)
      // Check if it's already in the correct position relative to previous child
      const currentChildren = Array.from(container.children).filter(c => c.classList.contains('token-sidebar-item'));
      const expectedIndex = index;

      if (currentChildren[expectedIndex] !== el) {
          // If subTabs exist, we insert after it
          const offset = subTabs ? 1 : 0;
          const refNode = container.children[expectedIndex + offset];
          if (refNode) {
              container.insertBefore(el, refNode);
          } else {
              container.appendChild(el);
          }
      }
  });

  // Handle Pagination UI
  let pager = document.getElementById('tokenPager');
  const hasMoreLocal = filtered.length > window.displayLimit;
  const mightHaveMoreAPI = !filter && window.hasMoreTokens;

  if (hasMoreLocal || mightHaveMoreAPI) {
      if (!pager) {
          pager = document.createElement('div');
          pager.id = 'tokenPager';
          pager.className = 'p-6 flex justify-center w-full';
          container.appendChild(pager);
      }
      const pagerHtml = `<button id="loadMoreTokensBtn" onclick="window.loadMoreTokens('${filter}')" class="px-6 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-up transition-all">Load More Tokens</button>`;
      if (pager.innerHTML !== pagerHtml) pager.innerHTML = pagerHtml;
  } else {
      if (pager) pager.remove();

      let endMarker = document.getElementById('tokenEndMarker');
      if (filtered.length > 0) {
          if (!endMarker) {
              endMarker = document.createElement('div');
              endMarker.id = 'tokenEndMarker';
              endMarker.className = 'py-4 text-center text-[8px] text-muted-text uppercase font-black tracking-widest';
              endMarker.textContent = 'End of Token List';
              container.appendChild(endMarker);
          }
      } else if (endMarker) {
          endMarker.remove();
      }
  }
};

// ===== CREATE TOKEN ELEMENT =====
window.createTokenElement = function(addr) {
    const el = document.createElement('div');
    el.className = 'token-sidebar-item p-3 flex items-center gap-3 cursor-pointer border-b border-card hover:bg-surface transition-all group';
    el.setAttribute('data-token', addr);
    el.onclick = () => window.selectPRC20(addr);

    // Initial skeleton - Restored Layout + New Theme
    el.innerHTML = `
        <div class="relative flex-shrink-0">
            <div class="token-logo-container w-10 h-10 border-2 border-card bg-surface flex items-center justify-center text-[10px] font-black text-muted-text shadow-brutal-sm">?</div>
            <div class="pump-indicator absolute -top-1 -right-1 w-3 h-3 bg-meme-green border border-card shadow-brutal-sm animate-pulse hidden"></div>
            <div class="verified-indicator absolute -bottom-1 -right-1 text-[8px] text-meme-cyan bg-surface border border-card shadow-brutal-sm hidden"><i class="fas fa-check-circle"></i></div>
        </div>
        <div class="flex-1 min-w-0 overflow-hidden">
            <div class="flex items-center justify-between gap-2 mb-0.5">
                <span class="token-symbol font-display text-base text-primary-text truncate italic uppercase tracking-tighter flex-1">...</span>
                <span class="token-change font-mono text-[10px] font-black uppercase text-secondary-text shrink-0">0.00%</span>
            </div>
            <div class="flex items-center justify-between text-[8px] font-mono font-bold text-muted-text uppercase italic">
                <span class="token-name truncate flex-1">Loading...</span>
                <div class="flex flex-col items-end">
                    <span class="token-mcap text-secondary-text">MCap -</span>
                    <span class="token-liq text-muted-text text-[6px]">Liq -</span>
                </div>
            </div>
        </div>
        <button class="info-btn p-1 text-muted-text hover:text-meme-green transition-colors">
            <i class="fas fa-info-circle text-xs"></i>
        </button>
    `;

    el.querySelector('.info-btn').onclick = (e) => {
        e.stopPropagation();
        window.showTokenDetail(e, addr);
    };

    return el;
};

// ===== PATCH TOKEN ELEMENT (THE HEART OF DYNAMIC UPDATE) =====
window.patchTokenElement = function(el, addr) {
    const detail = window.tokenDetails.get(addr);
    if (!detail) return;

    const isActive = window.currentPRC20 === addr;
    if (isActive) {
        el.classList.add('active', 'bg-meme-green/10', 'border-l-4', 'border-l-meme-green');
    } else {
        el.classList.remove('active', 'bg-meme-green/10', 'border-l-4', 'border-l-meme-green');
    }

    // Update Symbol
    const symbolEl = el.querySelector('.token-symbol');
    const safeSymbol = window.escapeHtml(detail.symbol || '?');
    if (symbolEl.textContent !== safeSymbol) symbolEl.textContent = safeSymbol;

    // Update Name
    const nameEl = el.querySelector('.token-name');
    const safeName = window.escapeHtml(detail.name || addr.slice(0, 8));
    if (nameEl.textContent !== safeName) nameEl.textContent = safeName;

    // Update Price Change (Optimized: Stable binding)
    const changeEl = el.querySelector('.token-change');
    const priceChangeRaw = window.numtokenlist(detail.price_change_24h);
    const priceChangePct = priceChangeRaw * 100;
    const changeText = `${priceChangePct >= 0 ? '+' : ''}${priceChangePct.toFixed(2)}%`;

    if (changeEl.textContent !== changeText) {
        changeEl.textContent = changeText;
        changeEl.classList.remove('text-up', 'text-down');
        changeEl.classList.add(priceChangePct >= 0 ? 'text-up' : 'text-down');
    }

    // Update MCap
    const mcapEl = el.querySelector('.token-mcap');
    const mcapUsd = window.numtokenlist(detail.market_cap_usd);
    const mcapText = `MCap $${window.formatAmount(mcapUsd)}`;
    if (mcapEl.textContent !== mcapText) mcapEl.textContent = mcapText;

    // Update Liquidity
    const liqEl = el.querySelector('.token-liq');
    const liqUsd = window.numtokenlist(detail.liquidity_usd);
    const liqText = `Liq $${window.formatAmount(liqUsd)}`;
    if (liqEl.textContent !== liqText) liqEl.textContent = liqText;

    // Update Indicators
    const pumpInd = el.querySelector('.pump-indicator');
    if (detail.is_pump) pumpInd.classList.remove('hidden'); else pumpInd.classList.add('hidden');

    const verInd = el.querySelector('.verified-indicator');
    if (detail.verified) verInd.classList.remove('hidden'); else verInd.classList.add('hidden');

    // Update Logo
    const logoContainer = el.querySelector('.token-logo-container');
    const logoUrl = window.normalizeLogoUrl(detail.logo);
    if (logoUrl) {
        let img = logoContainer.querySelector('img');
        if (!img) {
            logoContainer.innerHTML = '';
            img = document.createElement('img');
            img.className = 'w-10 h-10 border-2 border-card group-hover:rotate-6 transition-transform object-cover';
            img.loading = 'lazy';
            img.onerror = () => {
                img.classList.add('hidden');
                logoContainer.textContent = safeSymbol.charAt(0);
            };
            logoContainer.appendChild(img);
        }
        if (img.src !== logoUrl) img.src = logoUrl;
        img.classList.remove('hidden');
    } else {
        logoContainer.innerHTML = safeSymbol.charAt(0);
    }
};

window.setSubSort = function(subSort) { 
    window.currentSubSort = subSort; window.renderTokenSidebar(); 
};

window.isTokenSidebarLoading = false;
window.loadMoreTokens = async function(filter) {
    if (window.isTokenSidebarLoading) return;
    window.isTokenSidebarLoading = true;
    const btn = document.getElementById('loadMoreTokensBtn');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin mr-2"></i> Loading...';
    }
    try {
        if (!filter) {
            // Check if we have more tokens already in memory but not displayed
            const currentTotal = window.tokenAddresses.length;
            if (window.displayLimit < currentTotal) {
                window.displayLimit += 20;
                if (window.displayLimit > currentTotal) window.displayLimit = currentTotal;
            } else if (window.hasMoreTokens) {
                // Fetch next page from API
                await window.fetchNextContractPage();
                window.displayLimit = window.tokenAddresses.length;
            }
        } else {
            window.displayLimit += 20;
        }
        window.renderTokenSidebar(filter, true);
    } catch (e) {
        console.error('Load more error:', e);
    } finally {
        window.isTokenSidebarLoading = false;
    }
};

// ===== TICKER NEWS LOGIC =====
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

// ===== UPDATE TOKEN CARD (LEGACY WRAPPER) =====
window.updateTokenCard = function(address) {
    const el = window.tokenElementMap.get(address) || document.querySelector(`[data-token="${address}"]`);
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
    modal.innerHTML = `
        <div class="bg-card rounded-2xl max-w-2xl w-full max-h-[60vh] overflow-y-auto border border-border">
            <div class="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                <h3 class="text-lg font-bold">Token Details</h3>
                <div class="flex gap-2">
                    <button onclick="window.shareToken('${address}')" class="text-secondary-text hover:text-primary-text px-2"><i class="fas fa-share-alt"></i></button>
                    <button onclick="this.closest('.fixed').remove()" class="text-secondary-text hover:text-primary-text"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <div class="flex items-center gap-4 mb-6">
                    ${detail.logo ? `<img src="${detail.logo}" class="w-20 h-20 rounded-full border border-border" alt="${safeName}">` : `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-primary-text font-bold text-3xl">${safeSymbol.charAt(0)}</div>`}
                    <div><h2 class="text-2xl font-bold">${safeName}</h2><span class="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-sm font-mono">${safeSymbol}</span>${detail.verified ? '<i class="fas fa-check-circle text-blue-400 text-sm ml-2"></i>' : ''}</div>
                </div>
                ${detail.description ? `<div class="bg-bg rounded-xl p-4 border border-border"><h4 class="text-xs font-bold text-secondary-text uppercase mb-2">Description</h4><p class="text-sm text-gray-300">${safeDescription}</p></div>` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-secondary-text uppercase">Token Info</h4>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Supply</span><span class="font-bold">${totalSupply}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Decimals</span><span class="font-bold">${detail.decimals}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Holders</span><span class="font-bold">${detail.holders.toLocaleString()}</span></div>
                    </div>
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-secondary-text uppercase">Market Data</h4>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Price</span><span class="font-bold text-up">$${window.formatPrice(detail.price_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">MCap</span><span class="font-bold">$${window.formatAmount(detail.market_cap_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-secondary-text">Liquidity</span><span class="font-bold text-blue-400">$${window.formatAmount(detail.liquidity_usd)}</span></div>
                    </div>
                </div>
                <div class="bg-bg rounded-xl p-4 border border-border">
                    <h4 class="text-xs font-bold text-secondary-text uppercase mb-2">Contract Address</h4>
                    <div class="flex items-center gap-2"><code class="text-xs text-secondary-text font-mono flex-1">${window.shortenAddress(address, 12)}</code><button onclick="window.copyAddress(event, '${address}')" class="px-3 py-1 bg-card border border-border rounded text-[10px] font-bold hover:text-up transition-all">COPY</button></div>
                </div>
                <button onclick="window.selectPRC20('${address}'); this.closest('.fixed').remove();" class="w-full py-4 btn-trade rounded-xl font-black text-sm uppercase tracking-widest shadow-brutal-sm">Swap This Token</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};
