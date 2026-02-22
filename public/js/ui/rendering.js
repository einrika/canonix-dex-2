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
            <button onclick="window.setSubSort('all')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'all' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">ALL NON-PUMP</button>
            <button onclick="window.setSubSort('new')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'new' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">NEW</button>
            <button onclick="window.setSubSort('gainer')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'gainer' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">GAINER</button>
            <button onclick="window.setSubSort('hot')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'hot' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">HOT</button>
            <button onclick="window.setSubSort('marketcap')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'marketcap' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">MCAP</button>
            <button onclick="window.setSubSort('verified')" class="px-3 py-1 text-[9px] font-display border-2 border-black uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'verified' ? 'bg-meme-cyan text-black' : 'bg-black text-white hover:bg-meme-cyan/20'}">VERIFIED</button>
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
    empty.className = 'text-center text-gray-400 py-8 empty-state';
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
              endMarker.className = 'py-4 text-center text-[8px] text-gray-600 uppercase font-black tracking-widest';
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
    el.className = 'token-sidebar-item p-3 flex items-center gap-3 cursor-pointer border-b border-black hover:bg-meme-surface transition-all group';
    el.setAttribute('data-token', addr);
    el.onclick = () => window.selectPRC20(addr);

    // Initial skeleton - Restored Layout + New Theme
    el.innerHTML = `
        <div class="relative flex-shrink-0">
            <div class="token-logo-container w-10 h-10 border-2 border-black bg-meme-surface flex items-center justify-center text-[10px] font-black text-gray-600 shadow-brutal-sm">?</div>
            <div class="pump-indicator absolute -top-1 -right-1 w-3 h-3 bg-meme-green border border-black shadow-brutal-sm animate-pulse hidden"></div>
            <div class="verified-indicator absolute -bottom-1 -right-1 text-[8px] text-meme-cyan bg-black border border-black shadow-brutal-sm hidden"><i class="fas fa-check-circle"></i></div>
        </div>
        <div class="flex-1 min-w-0 overflow-hidden">
            <div class="flex items-center justify-between gap-2 mb-0.5">
                <span class="token-symbol font-display text-base text-white truncate italic uppercase tracking-tighter flex-1">...</span>
                <span class="token-change font-mono text-[10px] font-black uppercase text-gray-500 shrink-0">0.00%</span>
            </div>
            <div class="flex items-center justify-between text-[8px] font-mono font-bold text-gray-600 uppercase italic">
                <span class="token-name truncate flex-1">Loading...</span>
                <div class="flex flex-col items-end">
                    <span class="token-mcap text-gray-500">MCap -</span>
                    <span class="token-liq text-gray-700 text-[6px]">Liq -</span>
                </div>
            </div>
        </div>
        <button class="info-btn p-1 text-gray-600 hover:text-meme-green transition-colors">
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

    // Update Price Change
    const changeEl = el.querySelector('.token-change');
    const priceChangeRaw = window.numtokenlist(detail.price_change_24h);
    const priceChangePct = priceChangeRaw * 100;
    const changeText = `${priceChangePct >= 0 ? '+' : ''}${priceChangePct.toFixed(2)}%`;

    if (changeEl.textContent !== changeText) {
        changeEl.textContent = changeText;
        changeEl.classList.remove('text-meme-green', 'text-meme-pink');
        changeEl.classList.add(priceChangePct >= 0 ? 'text-meme-green' : 'text-meme-pink');
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
            img.className = 'w-10 h-10 border-2 border-black group-hover:rotate-6 transition-transform object-cover';
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

window.setSubSort = function(subSort) { window.currentSubSort = subSort; window.renderTokenSidebar(); };

window.isTokenSidebarLoading = false;
window.loadMoreTokens = async function(filter) {
    if (window.isTokenSidebarLoading) return;
    window.isTokenSidebarLoading = true;
    const btn = document.getElementById('loadMoreTokensBtn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading...'; }
    try {
        if (!filter) { await window.fetchNextContractPage(); window.displayLimit = window.tokenAddresses.length; }
        else { window.displayLimit += 20; }
        window.renderTokenSidebar(filter, true);
    } catch (e) { console.error('Load more error:', e); } finally { window.isTokenSidebarLoading = false; }
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
    const spanClass = "text-meme-surface bg-black/10 px-1 ml-1 font-mono font-bold";

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

// ===== RENDER SWAP TERMINAL (MAIN CONTENT or SIDEBAR) =====
window.renderSwapTerminal = async function() {
    let container = document.getElementById('mainSwapTerminal');
    const mainWrapper = document.getElementById('mainSwapContainer');

    if (!container) {
        container = document.getElementById('sidebarContent');
    }

    if (!container) return;

    // Visibility Rule: Swap terminal functionality only shows if wallet is connected (Phase 4 Revision)
    if (!window.wallet) {
        if (mainWrapper) {
            mainWrapper.classList.add('hidden');
        }

        if (container && container.id === 'sidebarContent') {
            container.innerHTML = `
                <div class="text-center py-20 bg-meme-surface border-4 border-black shadow-brutal mx-4">
                    <i class="fas fa-wallet text-6xl mb-6 text-gray-800 rotate-12"></i>
                    <p class="text-sm font-display uppercase italic text-gray-600 tracking-tighter">Connect wallet to unlock terminal</p>
                </div>`;
        }
        return;
    } else if (mainWrapper) {
        mainWrapper.classList.remove('hidden');
    }

    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    const isBuy = window.tradeType === 'buy';
    const isWatchOnly = window.wallet?.isWatchOnly;

    // Render structure immediately
    const currentSlippage = window.slippage || 30.0;
    container.innerHTML = `
        <div class="flex flex-col gap-4 animate-fade-in max-w-full overflow-hidden p-1">
            ${isWatchOnly ? `
                <div class="p-3 bg-meme-yellow border-2 border-black shadow-brutal flex items-center gap-3 mb-2 rotate-[-1deg]">
                    <i class="fas fa-eye text-black text-sm animate-pulse"></i>
                    <div class="text-[10px] font-black text-black uppercase leading-tight italic">
                        Watch-only Mode: <span class="opacity-70">Balances view only.</span>
                    </div>
                </div>
            ` : ''}
            <div class="flex bg-black p-1 border-2 border-black shadow-brutal rotate-[0.5deg]">
                <button onclick="window.setSwapMode('buy')" id="buyTab" class="flex-1 py-2 font-display text-xl transition-all ${isBuy ? 'bg-meme-green text-black italic' : 'text-gray-600 italic hover:text-white'}">BUY</button>
                <button onclick="window.setSwapMode('sell')" id="sellTab" class="flex-1 py-2 font-display text-xl transition-all ${!isBuy ? 'bg-meme-pink text-white italic' : 'text-gray-600 italic hover:text-white'}">SELL</button>
            </div>
            <div class="space-y-4">
                <div class="bg-meme-surface p-4 border-4 border-black shadow-brutal-sm rotate-[-0.5deg] group hover:rotate-0 transition-all">
                    <div class="flex justify-between text-[10px] text-gray-600 mb-2 font-black uppercase italic tracking-widest">Pay <span onclick="window.setMaxPay()" class="cursor-pointer text-meme-cyan hover:underline flex items-center gap-1"><i class="fas fa-wallet opacity-50"></i> <span id="payBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-white placeholder-gray-800 italic uppercase" oninput="window.updateTradeOutput()">
                        <div class="px-3 py-1 bg-black border-2 border-black text-meme-cyan font-display text-lg italic uppercase shadow-brutal-sm" id="payTokenSymbol">${isBuy ? 'PAXI' : symbol}</div>
                    </div>
                    <div class="flex gap-2 mt-4">
                        <button onclick="window.setPercentAmount(25)" class="flex-1 py-1.5 bg-black border-2 border-black font-display text-sm text-gray-500 hover:text-white hover:border-meme-pink transition-all italic uppercase">25%</button>
                        <button onclick="window.setPercentAmount(50)" class="flex-1 py-1.5 bg-black border-2 border-black font-display text-sm text-gray-500 hover:text-white hover:border-meme-pink transition-all italic uppercase">50%</button>
                        <button onclick="window.setPercentAmount(75)" class="flex-1 py-1.5 bg-black border-2 border-black font-display text-sm text-gray-500 hover:text-white hover:border-meme-pink transition-all italic uppercase">75%</button>
                        <button onclick="window.setPercentAmount(100)" class="flex-1 py-1.5 bg-black border-2 border-black font-display text-sm text-gray-500 hover:text-white hover:border-meme-pink transition-all italic uppercase">MAX</button>
                    </div>
                    <div class="mt-4"><input type="range" id="tradePercentSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-black rounded-none appearance-none cursor-pointer accent-meme-green border border-gray-900" oninput="window.setPercentAmount(this.value)"></div>
                </div>

                <div class="flex justify-center -my-6 relative z-10"><button onclick="window.reverseTradePair()" class="w-10 h-10 bg-meme-cyan border-4 border-black shadow-brutal flex items-center justify-center hover:rotate-180 transition-all duration-500 group"><i class="fas fa-exchange-alt text-black text-lg group-hover:scale-110"></i></button></div>

                <div class="bg-meme-surface p-4 border-4 border-black shadow-brutal-sm rotate-[0.5deg]">
                    <div class="flex justify-between text-[10px] text-gray-600 mb-2 font-black uppercase italic tracking-widest">Receive <span id="recvBalContainer" class="flex items-center gap-1"><i class="fas fa-coins opacity-50"></i> <span id="recvBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-3xl font-display outline-none w-full text-gray-500 italic uppercase" readonly>
                        <div class="px-3 py-1 bg-black border-2 border-black text-meme-yellow font-display text-lg italic uppercase shadow-brutal-sm" id="recvTokenSymbol">${isBuy ? symbol : 'PAXI'}</div>
                    </div>
                </div>

                <div class="p-4 bg-black border-4 border-black shadow-brutal-sm space-y-3 font-mono">
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-gray-700">Rate</span><span id="tradeRate" class="text-white">1 PAXI = 0 ${symbol}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-gray-700">Min Recv</span><span id="minRecv" class="text-gray-500">0.00 ${isBuy ? symbol : 'PAXI'}</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-gray-700">Price Impact</span><span id="priceImpact" class="text-meme-green">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-gray-700">Variance</span><span id="actualSlippage" class="text-gray-500">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic border-t border-gray-900 pt-3"><span class="text-gray-700">Tolerance</span><button onclick="window.showSlippageModal()" class="text-meme-cyan hover:underline flex items-center gap-1"><span id="slippageVal">${currentSlippage.toFixed(1)}%</span> <i class="fas fa-cog text-[8px]"></i></button></div>
                    <div class="flex justify-between text-[9px] font-bold uppercase tracking-widest italic"><span class="text-gray-700">Network Fee</span><span id="networkFee" class="text-gray-600">~0.0063 PAXI</span></div>
                </div>

                <button onclick="${isWatchOnly ? '' : 'window.executeTrade()'}"
                        ${isWatchOnly ? 'disabled' : ''}
                        class="w-full py-5 ${isBuy ? 'bg-meme-green shadow-brutal-green' : 'bg-meme-pink shadow-brutal-pink'} text-black border-4 border-black font-display text-3xl uppercase italic transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed">
                    ${isWatchOnly ? 'WATCH-ONLY' : (isBuy ? 'BUY NOW' : 'SELL NOW')}
                </button>
            </div>
        </div>`;
    
    // Fetch fresh pool data and update balances in background
    (async () => {
        if (window.fetchPoolData) await window.fetchPoolData();
        if (window.updateTradeBalances) await window.updateTradeBalances();
        if (window.updateTradeOutput) window.updateTradeOutput();
    })();
};

// ===== RENDER TRANSACTION HISTORY (SIDEBAR) =====
window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="space-y-4">
        <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">RECENT TRANSACTIONS<button onclick="window.renderTransactionHistorySidebar()" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
        <div id="sidebar-tx-list" class="divide-y divide-border/20"><div class="text-center py-20"><div class="w-8 h-8 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
        <div id="tx-load-more" class="h-10 w-full flex items-center justify-center"></div>
    </div>`;
    window.historyPage = 1; window.historyIsEnd = false; await window.renderTxHistoryItems(true);
};

window.renderTxHistoryItems = async function(isInitial = false) {
    const listContainer = document.getElementById('sidebar-tx-list');
    const sentinelContainer = document.getElementById('tx-load-more');
    if (!listContainer || !window.wallet) return;
    const history = await window.loadTransactionHistory(window.wallet.address, window.historyPage);
    if (isInitial) listContainer.innerHTML = '';
    if (history.length === 0 && isInitial) {
        listContainer.innerHTML = '<div class="text-center py-20 text-gray-600 text-[10px] font-black uppercase tracking-widest">No history found</div>';
        if (sentinelContainer) sentinelContainer.innerHTML = ''; return;
    }
    const html = history.map(tx => {
        const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeColor = tx.type === 'Swap' ? 'text-up' : (tx.type === 'Transfer' ? 'text-blue-400' : 'text-gray-400');
        const icon = tx.type === 'Swap' ? 'fa-exchange-alt' : 'fa-paper-plane';
        return `<div class="p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 flex items-center justify-between" onclick="window.showTransactionDetailModal('${tx.hash}')">
            <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-card flex items-center justify-center ${typeColor}"><i class="fas ${icon} text-xs"></i></div>
                <div><div class="text-[10px] font-black ${typeColor} uppercase">${tx.type}</div><div class="text-xs font-mono text-gray-300 mt-0.5">${tx.amount.toFixed(4)} ${tx.denom === 'upaxi' ? 'PAXI' : tx.symbol || tx.denom}</div></div>
            </div>
            <div class="text-right">
                <div class="text-[9px] text-gray-500 font-mono">${tx.hash.slice(0, 10)}...</div>
                <div class="text-[8px] text-gray-600 mt-0.5">${timeStr}</div>
            </div>
        </div>`;
    }).join('');
    if (isInitial) { listContainer.innerHTML = html; } else { listContainer.insertAdjacentHTML('beforeend', html); }
    if (sentinelContainer) {
        if (!window.historyIsEnd) {
            sentinelContainer.innerHTML = `<button onclick="window.loadMoreHistory()" class="px-4 py-1.5 bg-card border border-border rounded-lg text-[8px] font-black uppercase hover:border-up transition-all">Load More</button>`;
        } else {
            sentinelContainer.innerHTML = `<span class="text-[8px] text-gray-700 uppercase font-black tracking-widest py-4">End of transactions</span>`;
        }
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

// ===== RENDER LP TERMINAL (SIDEBAR) =====
window.renderLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    // Fetch fresh pool data directly from blockchain
    if (window.fetchPoolData) {
        await window.fetchPoolData();
    }
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-4 animate-fade-in">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2">Liquidity Provision</h4>
            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <div class="flex justify-between text-[10px] text-gray-400 mb-1">PAXI Amount <span class="text-[9px]">Bal: <span id="lpPaxiBalance">0.00</span></span></div>
                    <input type="number" id="lpPaxiAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-white font-bold outline-none focus:border-up" oninput="window.updateLPFromInput('paxi')">
                    <input type="range" id="lpPaxiSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up" oninput="window.updateLPFromSlider('paxi', this.value)">
                </div>
                <div class="text-center text-up"><i class="fas fa-plus scale-75"></i></div>
                <div>
                    <div class="flex justify-between text-[10px] text-gray-400 mb-1">${symbol} Amount <span class="text-[9px]">Bal: <span id="lpTokenBalance">0.00</span></span></div>
                    <input type="number" id="lpTokenAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-white font-bold outline-none focus:border-up" oninput="window.updateLPFromInput('token')">
                    <input type="range" id="lpTokenSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-up" oninput="window.updateLPFromSlider('token', this.value)">
                </div>
                <div id="estimatedLP" class="text-[10px] text-up font-black text-center h-4"></div>
                <button onclick="window.executeAddLP()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Add Liquidity</button>
            </div>
            <div class="bg-surface border border-border p-4 rounded-2xl space-y-2.5">
                <h5 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Your Position</h5>
                <div class="flex justify-between text-xs"><span class="text-gray-400 font-bold uppercase text-[9px]">LP Tokens</span><span id="yourLPTokens" class="font-black text-up">0.00</span></div>
                <div class="flex justify-between text-xs"><span class="text-gray-400 font-bold uppercase text-[9px]">Pool Ratio</span><span id="poolRatioDisplay" class="font-mono text-[9px] text-gray-300">-</span></div>
                <div id="yourPositionDetails"></div>
            </div>
            <div class="bg-down/5 p-4 rounded-2xl border border-down/10">
                <h5 class="text-[10px] font-black text-down uppercase mb-3 tracking-widest">Remove Liquidity</h5>
                <div class="flex justify-between text-[9px] text-gray-500 mb-2 font-bold">AMOUNT TO WITHDRAW</div>
                <input type="number" id="lpRemoveAmount" placeholder="0.00" class="bg-bg border border-border rounded-xl p-3 w-full text-white font-bold mb-2 outline-none focus:border-down" oninput="window.updateRemoveLPFromInput()">
                <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full mb-4 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.updateRemoveLPFromSlider(this.value)">
                <button onclick="window.executeRemoveLP()" class="w-full py-3 bg-down/20 text-down border border-down/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-down hover:text-white transition-all">Withdraw Assets</button>
            </div>
        </div>`;

    // Update LP balances immediately - fetch langsung dari blockchain
    if (window.updateLPBalances) {
        window.updateLPBalances();
    }
};

// ===== RENDER REMOVE LP TERMINAL (SIDEBAR) =====
window.renderRemoveLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    await window.fetchPoolData();
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';

    container.innerHTML = `
        <div class="space-y-4 animate-in slide-in-from-right duration-300">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-xs font-black uppercase tracking-tighter text-gray-400">Remove Liquidity</h3>
                <div class="px-2 py-0.5 bg-down/10 text-down text-[9px] rounded-full border border-down/20 font-bold">BURN LP</div>
            </div>

            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <div class="flex justify-between text-[10px] text-gray-400 mb-1">LP Tokens to Remove <span class="text-[9px]">Max: <span id="maxLPTokens">0.00</span></span></div>
                    <div class="relative">
                        <input type="number" id="removeLPInput" placeholder="0.00" class="w-full bg-bg border border-border rounded-xl px-4 py-3 text-sm font-mono focus:border-down outline-none transition-all pr-12">
                        <span class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-500">LP</span>
                    </div>
                </div>
            </div>

            <div class="bg-surface border border-border p-4 rounded-2xl space-y-2.5">
                <h5 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Estimated Return</h5>
                <div class="flex justify-between text-xs"><span class="text-gray-400 font-bold uppercase text-[9px]">PAXI</span><span id="estPaxiReturn" class="font-black text-white">0.00</span></div>
                <div class="flex justify-between text-xs"><span class="text-gray-400 font-bold uppercase text-[9px]">${symbol}</span><span id="estTokenReturn" class="font-black text-white">0.00</span></div>
            </div>

            <button onclick="window.removeLiquidity()" class="w-full py-4 bg-down/20 text-down border border-down/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-down hover:text-white transition-all">
                Remove Liquidity
            </button>

            <div class="flex justify-center">
                <button onclick="setSidebarTab('lp')" class="text-[10px] font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Switch to Add Liquidity</button>
            </div>
        </div>
    `;

    if (window.updateLPBalances) {
        window.updateLPBalances();
    }
};

// ===== RENDER SEND TERMINAL (SIDEBAR) =====
window.renderSendTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2">Send Assets</h4>
            <div class="bg-card p-4 rounded-2xl border border-border space-y-4">
                <div>
                    <label class="text-[9px] text-gray-500 font-bold uppercase ml-1">Recipient Address</label>
                    <input type="text" id="sendRecipient" placeholder="paxi1..." class="bg-bg border border-border rounded-xl p-3 w-full text-white font-mono text-xs mt-1">
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="text-[9px] text-gray-500 font-bold uppercase ml-1">Amount</label>
                        <input type="number" id="sendAmount" placeholder="0.0" class="bg-bg border border-border rounded-xl p-3 w-full text-white font-bold mt-1">
                    </div>
                    <div class="w-24">
                        <label class="text-[9px] text-gray-500 font-bold uppercase ml-1">Asset</label>
                        <select id="sendTokenSelect" class="bg-bg border border-border rounded-xl p-3 w-full text-white text-[10px] font-bold mt-1 outline-none"><option value="upaxi">PAXI</option></select>
                    </div>
                </div>
                <button onclick="window.executeSend()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest">Send Assets</button>
            </div>
        </div>`;
    window.populateSendTokens();
};

// ===== RENDER BURN TERMINAL (SIDEBAR) =====
window.renderBurnTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2">Burn Tokens</h4>
            <div class="bg-down/5 p-6 rounded-2xl border border-down/10 text-center">
                <i class="fas fa-fire text-4xl text-down mb-4 opacity-50"></i>
                <p class="text-[10px] text-gray-400 leading-relaxed mb-6">Burning tokens permanently removes them from circulation, increasing scarcity.</p>
                <div class="bg-bg border border-border rounded-xl p-4 mb-4 text-left">
                    <div class="flex justify-between text-[9px] text-gray-500 mb-1">Amount of ${symbol} to Burn <span id="burnBalance" class="text-[8px] opacity-60">Bal: 0.00</span></div>
                    <input type="number" id="burnAmount" placeholder="0.0" class="bg-transparent w-full text-white font-bold outline-none" oninput="window.updateBurnSliderFromInput()">
                    <input type="range" id="burnSlider" min="0" max="100" step="1" value="0" class="w-full mt-3 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.setBurnPercent(this.value)">
                </div>
                <button onclick="window.executeBurn()" class="w-full py-4 bg-down text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,0,128,0.3)] hover:scale-[1.02] transition-all">Start The Fire</button>
            </div>
        </div>`;
    window.updateBurnBalanceDisplay();
};

// ===== RENDER DONATE TERMINAL (SIDEBAR) =====
window.renderDonateTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2">Support Development</h4>
            <div class="bg-up/5 p-6 rounded-2xl border border-up/10 text-center">
                <i class="fas fa-heart text-4xl text-up mb-4 opacity-50"></i>
                <p class="text-[10px] text-gray-400 leading-relaxed mb-6">Help us maintain and improve Canonix. Your donations keep the fire burning!</p>
                <div class="bg-bg border border-border rounded-xl p-4 mb-4 text-left">
                    <div class="flex justify-between text-[9px] text-gray-500 mb-1">Amount (PAXI)</div>
                    <input type="number" id="donationAmount" value="10" class="bg-transparent w-full text-white font-bold outline-none">
                </div>
                <button onclick="window.executeDonation()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-brutal-sm">Donate PAXI</button>
            </div>
        </div>`;
};

// ===== UPDATE TOKEN CARD (LEGACY WRAPPER) =====
window.updateTokenCard = function(address) {
    const el = window.tokenElementMap.get(address) || document.querySelector(`[data-token="${address}"]`);
    if (el) window.patchTokenElement(el, address);
};

// ===== SHOW TRANSACTION DETAIL MODAL =====
window.showTransactionDetailModal = async function(hash) {
    const data = await window.fetchTxDetail(hash);
    console.log('TX Detail for Modal:', data);

    if (!data) return;

    // Handle both wrapped and raw responses
    const tx = data.tx_response || data;
    if (!tx || (!tx.txhash && !tx.hash)) return;
    const body = data.tx.body;
    const timeStr = new Date(tx.timestamp).toLocaleString();
    const statusColor = tx.code === 0 ? 'text-up' : 'text-down';
    const statusText = tx.code === 0 ? 'SUCCESS' : 'FAILED';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/90 z-[600] flex items-center justify-center p-4 animate-fade-in';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    let messagesHtml = body.messages.map((m, i) => {
        const typeShort = m['@type'].split('.').pop();
        return `<div class="p-3 bg-card/50 rounded-xl border border-border/50 mb-2">
            <div class="text-[10px] font-black text-up uppercase mb-1">Message #${i+1}: ${typeShort}</div>
            <pre class="text-[9px] font-mono text-gray-400 overflow-x-auto">${JSON.stringify(m, null, 2)}</pre>
        </div>`;
    }).join('');

    modal.innerHTML = `
        <div class="bg-surface border border-border w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div class="p-6 border-b border-border flex justify-between items-center bg-card/30">
                <h3 class="text-lg font-black italic">TRANSACTION DETAIL</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-500 hover:text-white transition-all"><i class="fas fa-times"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 bg-bg rounded-2xl border border-border">
                        <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Status</div>
                        <div class="text-sm font-black ${statusColor}">${statusText}</div>
                    </div>
                    <div class="p-4 bg-bg rounded-2xl border border-border">
                        <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Block Height</div>
                    <div class="text-sm font-black text-white">${tx.height || tx.block || "-"}</div>
                    </div>
                </div>

                <div class="p-4 bg-bg rounded-2xl border border-border">
                    <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Transaction Hash</div>
                    <div class="flex items-center gap-2">
                        <code class="text-[10px] font-mono text-gray-300 flex-1">${window.shortenAddress(hash, 12)}</code>
                        <button onclick="window.copyAddress(event, '${hash}')" class="text-xs text-up"><i class="fas fa-copy"></i></button>
                    </div>
                </div>

                <div class="p-4 bg-bg rounded-2xl border border-border">
                    <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Timestamp</div>
                    <div class="text-xs text-white">${timeStr}</div>
                </div>

                <div>
                    <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Messages</h4>
                    ${messagesHtml}
                </div>

                <div class="p-4 bg-bg rounded-2xl border border-border">
                    <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Gas Used / Wanted</div>
                    <div class="text-xs text-white">${tx.gas_used || tx.gasUsed || "-"} / ${tx.gas_wanted || tx.gasWanted || "-"}</div>
                </div>

                ${tx.raw_log && tx.code !== 0 ? `
                    <div class="p-4 bg-down/5 rounded-2xl border border-down/20">
                        <div class="text-[9px] text-down uppercase font-black mb-1">Error Log</div>
                        <div class="text-[10px] font-mono text-down/80">${tx.raw_log}</div>
                    </div>
                ` : ''}
            </div>
            <div class="p-6 border-t border-border bg-card/30 flex gap-3">
                <a href="https://winscan.winsnip.xyz/tx/${hash}" target="_blank" class="flex-1 py-3 bg-up/10 text-up border border-up/20 rounded-xl font-black text-[10px] uppercase text-center hover:bg-up hover:text-bg transition-all">View on Explorer</a>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 py-3 bg-bg border border-border rounded-xl font-black text-[10px] uppercase">Close</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
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
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    modal.innerHTML = `
        <div class="bg-card rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
            <div class="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-card z-10">
                <h3 class="text-lg font-bold">Token Details</h3>
                <div class="flex gap-2">
                    <button onclick="window.shareToken('${address}')" class="text-gray-400 hover:text-white px-2"><i class="fas fa-share-alt"></i></button>
                    <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="p-6 space-y-4">
                <div class="flex items-center gap-4 mb-6">
                    ${detail.logo ? `<img src="${detail.logo}" class="w-20 h-20 rounded-full border border-border" alt="${safeName}">` : `<div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">${safeSymbol.charAt(0)}</div>`}
                    <div><h2 class="text-2xl font-bold">${safeName}</h2><span class="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-lg text-sm font-mono">${safeSymbol}</span>${detail.verified ? '<i class="fas fa-check-circle text-blue-400 text-sm ml-2"></i>' : ''}</div>
                </div>
                ${detail.description ? `<div class="bg-bg rounded-xl p-4 border border-border"><h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Description</h4><p class="text-sm text-gray-300">${safeDescription}</p></div>` : ''}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-gray-500 uppercase">Token Info</h4>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Supply</span><span class="font-bold">${totalSupply}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Decimals</span><span class="font-bold">${detail.decimals}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Holders</span><span class="font-bold">${detail.holders.toLocaleString()}</span></div>
                    </div>
                    <div class="bg-bg rounded-xl p-4 border border-border space-y-3">
                        <h4 class="text-xs font-bold text-gray-500 uppercase">Market Data</h4>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Price</span><span class="font-bold text-up">$${window.formatPrice(detail.price_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">MCap</span><span class="font-bold">$${window.formatAmount(detail.market_cap_usd)}</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Liquidity</span><span class="font-bold text-blue-400">$${window.formatAmount(detail.liquidity_usd)}</span></div>
                    </div>
                </div>
                <div class="bg-bg rounded-xl p-4 border border-border">
                    <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Contract Address</h4>
                    <div class="flex items-center gap-2"><code class="text-xs text-gray-400 font-mono flex-1">${window.shortenAddress(address, 12)}</code><button onclick="window.copyAddress(event, '${address}')" class="px-3 py-1 bg-card border border-border rounded text-[10px] font-bold hover:text-up transition-all">COPY</button></div>
                </div>
                <button onclick="window.selectPRC20('${address}'); this.closest('.fixed').remove();" class="w-full py-4 btn-trade rounded-xl font-black text-sm uppercase tracking-widest shadow-brutal-sm">Swap This Token</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};
