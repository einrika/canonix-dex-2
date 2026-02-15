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
            <button onclick="window.setSubSort('all')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'all' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">ALL NON-PUMP</button>
            <button onclick="window.setSubSort('new')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'new' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">NEW</button>
            <button onclick="window.setSubSort('gainer')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'gainer' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">GAINER</button>
            <button onclick="window.setSubSort('hot')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'hot' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">HOT</button>
            <button onclick="window.setSubSort('marketcap')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'marketcap' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">MARKET CAP</button>
            <button onclick="window.setSubSort('verified')" class="px-3 py-1 text-[9px] font-black uppercase tracking-tighter rounded-full transition-all ${window.currentSubSort === 'verified' ? 'bg-up text-bg shadow-glow-up' : 'text-gray-500 hover:text-gray-300'}">VERIFIED</button>
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
    el.className = 'token-sidebar-item p-3 flex items-center gap-3 cursor-pointer';
    el.setAttribute('data-token', addr);
    el.onclick = () => window.selectPRC20(addr);

    // Initial skeleton
    el.innerHTML = `
        <div class="relative flex-shrink-0">
            <div class="token-logo-container w-10 h-10 rounded-full bg-card flex items-center justify-center text-xs font-bold text-gray-500">?</div>
            <div class="pump-indicator absolute -top-1 -right-1 w-3 h-3 bg-up rounded-full border-2 border-surface animate-pulse hidden"></div>
            <div class="verified-indicator absolute -bottom-1 -right-1 text-[8px] text-blue-400 bg-bg rounded-full shadow-lg hidden"><i class="fas fa-check-circle"></i></div>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-1 mb-0.5">
                <span class="token-symbol font-bold text-sm truncate">...</span>
                <span class="token-change text-[10px] font-mono font-medium text-gray-500">0.00%</span>
            </div>
            <div class="flex items-center justify-between text-[10px] text-gray-500">
                <span class="token-name truncate max-w-[60px]">Loading...</span>
                <div class="flex flex-col items-end">
                    <span class="token-mcap text-gray-400">MCap -</span>
                    <span class="token-liq text-gray-600 text-[8px]">Liq -</span>
                </div>
            </div>
        </div>
        <button class="info-btn p-1 text-gray-600 hover:text-up transition-colors">
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
    if (isActive) el.classList.add('active'); else el.classList.remove('active');

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
    const priceChange = window.numtokenlist(detail.price_change_24h);
    const changeText = `${priceChange >= 0 ? '+' : ''}${(priceChange * 100).toFixed(2)}%`;
    if (changeEl.textContent !== changeText) {
        changeEl.textContent = changeText;
        changeEl.className = `token-change text-[10px] font-mono font-medium ${priceChange >= 0 ? 'text-up' : 'text-down'}`;
    }

    // Update MCap
    const mcapEl = el.querySelector('.token-mcap');
    const marketCap = window.numtokenlist(detail.market_cap);
    const mcapText = `MCap ${window.formatAmount(marketCap)}`;
    if (mcapEl.textContent !== mcapText) mcapEl.textContent = mcapText;

    // Update Liquidity
    const liqEl = el.querySelector('.token-liq');
    const liquidity = window.numtokenlist(detail.liquidity);
    const liqText = `Liq ${window.formatAmount(liquidity)}`;
    if (liqEl.textContent !== liqText) liqEl.textContent = liqText;

    // Update Indicators
    const pumpInd = el.querySelector('.pump-indicator');
    if (detail.is_pump) pumpInd.classList.remove('hidden'); else pumpInd.classList.add('hidden');

    const verInd = el.querySelector('.verified-indicator');
    if (detail.verified) verInd.classList.remove('hidden'); else verInd.classList.add('hidden');

    // Update Logo
    const logoContainer = el.querySelector('.token-logo-container');
    if (detail.logo) {
        let img = logoContainer.querySelector('img');
        if (!img) {
            logoContainer.innerHTML = ''; // Clear fallback text
            img = document.createElement('img');
            img.className = 'w-10 h-10 rounded-full border border-border';
            img.loading = 'lazy';
            img.onerror = () => {
                img.style.display = 'none';
                logoContainer.textContent = safeSymbol.charAt(0);
            };
            logoContainer.appendChild(img);
        }
        if (img.src !== detail.logo) img.src = detail.logo;
        img.style.display = 'block';
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
    let html = '';
    gainers.forEach(t => { html += `<div class="ticker-item">GAINER: ${t.symbol} <span>+${(t.price_change_24h * 100).toFixed(2)}%</span></div>`; });
    hot.forEach(t => { html += `<div class="ticker-item">HOT: ${t.symbol} <span>Vol ${window.formatAmount(t.volume_24h)}</span></div>`; });
    window.setHtml(tickerContainer, html);
};

// ===== RENDER WALLET DETAILS (SIDEBAR) =====
window.renderWalletDetails = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="flex flex-col gap-6">
        <div class="stat-card">
            <div class="text-[10px] text-gray-500 uppercase font-black mb-1">Native Balance</div>
            <div class="text-2xl font-black text-up" id="sidebar-paxi-bal">0.00 PAXI</div>
            <div class="text-[9px] text-gray-600 font-mono mt-1">${window.wallet.address}</div>
        </div>
        <div class="space-y-4">
            <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">MY ASSETS<button onclick="window.renderWalletDetails()" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
            <div id="sidebar-assets-list" class="space-y-2"><div class="text-center py-8"><div class="spinner mx-auto scale-50"></div></div></div>
        </div>
    </div>`;
    window.updateBalances();
    const tokens = await window.loadWalletTokens(window.wallet.address);
    const assetList = document.getElementById('sidebar-assets-list');
    if (!assetList) return;
    if (tokens.length === 0) { assetList.innerHTML = '<p class="text-center text-gray-600 text-[10px] py-4">No PRC20 assets found</p>'; }
    else {
        assetList.innerHTML = tokens.map(t => {
            const detail = t.detail;
            const balance = parseFloat(t.balance) / Math.pow(10, detail.decimals);
            const value = balance * detail.price_paxi;
            return `<div class="p-3 bg-card rounded-xl border border-border flex items-center justify-between hover:border-up transition-all cursor-pointer" onclick="window.selectPRC20('${t.address}')">
                <div class="flex items-center gap-3">
                    <img src="${detail.logo}" class="w-8 h-8 rounded-full border border-border" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="w-8 h-8 rounded-full bg-up/10 items-center justify-center text-up font-bold text-xs" style="display:none;">${detail.symbol.charAt(0)}</div>
                    <div><div class="text-xs font-bold">${detail.symbol}</div><div class="text-[9px] text-gray-500">${balance.toFixed(2)}</div></div>
                </div>
                <div class="text-right">
                    <div class="text-xs font-bold text-white">${window.formatAmount(value)} PAXI</div>
                    <div class="text-[9px] ${detail.price_change_24h >= 0 ? 'text-up' : 'text-down'}">${detail.price_change_24h >= 0 ? '+' : ''}${(detail.price_change_24h*100).toFixed(2)}%</div>
                </div>
            </div>`;
        }).join('');
    }
};

// ===== RENDER SWAP TERMINAL (SIDEBAR) =====
window.renderSwapTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    const isBuy = window.tradeType === 'buy';
    const isAuto = window.orderType === 'auto';
    container.innerHTML = `
        <div class="flex flex-col gap-4 animate-fade-in">
            <div class="flex bg-bg/50 p-1 rounded-xl border border-border/50">
                <button onclick="window.setOrderType('instant')" id="type-instant" class="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${!isAuto ? 'bg-border text-white' : 'text-gray-500'}">Instant</button>
                <button onclick="window.setOrderType('auto')" id="type-auto" class="flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${isAuto ? 'bg-border text-white' : 'text-gray-500'}">Auto Order</button>
            </div>
            <div class="flex bg-bg p-1 rounded-xl border border-border shadow-inner">
                <button onclick="window.setSwapMode('buy')" id="buyTab" class="flex-1 py-2 rounded-lg text-xs font-black transition-all ${isBuy ? 'bg-up text-bg shadow-glow-up' : 'text-gray-400'}">BUY</button>
                <button onclick="window.setSwapMode('sell')" id="sellTab" class="flex-1 py-2 rounded-lg text-xs font-black transition-all ${!isBuy ? 'bg-down text-white shadow-glow-down' : 'text-gray-400'}">SELL</button>
            </div>
            <div class="space-y-3">
                <div class="bg-card p-4 rounded-2xl border border-border hover:border-border/80 transition-all">
                    <div class="flex justify-between text-[10px] text-gray-500 mb-2 font-black uppercase">Pay <span onclick="window.setMaxPay()" class="cursor-pointer hover:text-up flex items-center gap-1"><i class="fas fa-wallet opacity-50"></i> <span id="payBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-xl font-black outline-none w-full text-white placeholder-gray-700" oninput="window.updateTradeOutput()">
                        <div class="px-3 py-1 bg-bg border border-border rounded-lg text-[10px] font-black" id="payTokenSymbol">${isBuy ? 'PAXI' : symbol}</div>
                    </div>
                    <div class="flex gap-1.5 mt-3">
                        <button onclick="window.setPercentAmount(25)" class="flex-1 py-1 bg-bg border border-border rounded text-[9px] font-black text-gray-500 hover:text-white hover:border-gray-600 transition-all">25%</button>
                        <button onclick="window.setPercentAmount(50)" class="flex-1 py-1 bg-bg border border-border rounded text-[9px] font-black text-gray-500 hover:text-white hover:border-gray-600 transition-all">50%</button>
                        <button onclick="window.setPercentAmount(75)" class="flex-1 py-1 bg-bg border border-border rounded text-[9px] font-black text-gray-500 hover:text-white hover:border-gray-600 transition-all">75%</button>
                        <button onclick="window.setPercentAmount(100)" class="flex-1 py-1 bg-bg border border-border rounded text-[9px] font-black text-gray-500 hover:text-white hover:border-gray-600 transition-all">MAX</button>
                    </div>
                    <div class="mt-3"><input type="range" id="tradePercentSlider" min="0" max="100" step="1" value="0" class="w-full h-1.5 bg-bg/50 rounded-lg appearance-none cursor-pointer accent-up" oninput="window.setPercentAmount(this.value)"></div>
                </div>
                <div class="flex justify-center -my-6 relative z-10"><button onclick="window.reverseTradePair()" class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center hover:rotate-180 transition-all duration-500 shadow-xl group"><i class="fas fa-arrow-down text-xs text-up group-hover:scale-110"></i></button></div>
                <div class="bg-card p-4 rounded-2xl border border-border">
                    <div class="flex justify-between text-[10px] text-gray-500 mb-2 font-black uppercase">Receive <span id="recvBalContainer" class="flex items-center gap-1"><i class="fas fa-coins opacity-50"></i> <span id="recvBalance">0.00</span></span></div>
                    <div class="flex items-center gap-3">
                        <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-xl font-black outline-none w-full text-gray-500" readonly>
                        <div class="px-3 py-1 bg-bg border border-border rounded-lg text-[10px] font-black" id="recvTokenSymbol">${isBuy ? symbol : 'PAXI'}</div>
                    </div>
                </div>
                <div id="autoOrderContainer" class="${isAuto ? '' : 'hidden'} animate-slide-down bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl space-y-3">
                    <div class="flex justify-between items-center"><label class="text-[10px] font-black text-purple-400 uppercase tracking-widest">Trigger Price (PAXI)</label><button onclick="window.useCurrentPriceAsLimit()" class="text-[9px] font-bold text-gray-500 hover:text-white uppercase underline">Use Current</button></div>
                    <input type="number" id="limitPriceInput" placeholder="0.000000" class="w-full bg-bg border border-purple-500/30 rounded-xl p-3 text-white font-mono text-sm outline-none focus:border-purple-500">
                    <p class="text-[9px] text-gray-500 italic">Order will execute automatically when price hits this level.</p>
                </div>
                <div class="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2.5">
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter"><span class="text-gray-500">Rate</span><span id="tradeRate" class="text-white font-mono">1 PAXI = 0 ${symbol}</span></div>
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter"><span class="text-gray-500">Minimum Received</span><span id="minRecv" class="text-gray-400 font-mono">0.00 ${isBuy ? symbol : 'PAXI'}</span></div>
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter"><span class="text-gray-500">Price Impact</span><span id="priceImpact" class="text-up font-mono">0.00%</span></div>
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter"><span class="text-gray-500">Slippage Tolerance</span><button onclick="window.showSlippageModal()" class="text-up hover:underline flex items-center gap-1"><span id="slippageVal">1.0%</span> <i class="fas fa-cog text-[8px]"></i></button></div>
                    <div class="flex justify-between text-[9px] font-black uppercase tracking-tighter pt-1 border-t border-white/5"><span class="text-gray-500">Network Fee</span><span id="networkFee" class="text-gray-400 font-mono">~0.0063 PAXI</span></div>
                </div>
                <button onclick="window.executeTrade()" class="btn-trade w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-glow-up transform active:scale-[0.98] transition-all">${isAuto ? 'Create Auto Order' : 'Execute ' + window.tradeType.toUpperCase()}</button>
            </div>
        </div>`;
    
    // Update balances immediately - fetch langsung dari blockchain
    if (window.updateTradeBalances) {
        window.updateTradeBalances();
    }
};

// ===== RENDER TRANSACTION HISTORY (SIDEBAR) =====
window.renderTransactionHistorySidebar = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container || !window.wallet) return;
    container.innerHTML = `<div class="space-y-4">
        <h4 class="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-border pb-2 flex justify-between items-center">RECENT TRANSACTIONS<button onclick="window.renderTransactionHistorySidebar()" class="hover:text-up"><i class="fas fa-sync-alt scale-75"></i></button></h4>
        <div id="sidebar-tx-list" class="divide-y divide-border/20"><div class="text-center py-20"><div class="spinner mx-auto scale-50"></div></div></div>
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
window.renderLPTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
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
                <button onclick="window.executeAddLP()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-glow-up">Add Liquidity</button>
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
                <input type="number" id="lpRemoveAmount" placeholder="0.00" class="bg-bg border border-border rounded-xl p-3 w-full text-white font-bold mb-2 outline-none focus:border-down">
                <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full mb-4 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-down" oninput="window.updateRemoveLPFromSlider(this.value)">
                <button onclick="window.executeRemoveLP()" class="w-full py-3 bg-down/20 text-down border border-down/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-down hover:text-white transition-all">Withdraw Assets</button>
            </div>
        </div>`;
    
    // Update LP balances immediately - fetch langsung dari blockchain
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
                <button onclick="window.executeDonation()" class="w-full py-4 btn-trade rounded-xl font-black text-xs uppercase tracking-widest shadow-glow-up">Donate PAXI</button>
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
    window.showNotif('Fetching transaction details...', 'info');
    const data = await window.fetchTxDetail(hash);
    if (!data || !data.tx_response) {
        window.showNotif('Failed to fetch transaction details', 'error');
        return;
    }

    const tx = data.tx_response;
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
                        <div class="text-sm font-black text-white">${tx.height}</div>
                    </div>
                </div>

                <div class="p-4 bg-bg rounded-2xl border border-border">
                    <div class="text-[9px] text-gray-500 uppercase font-black mb-1">Transaction Hash</div>
                    <div class="flex items-center gap-2">
                        <code class="text-[10px] font-mono text-gray-300 truncate flex-1">${hash}</code>
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
                    <div class="text-xs text-white">${tx.gas_used} / ${tx.gas_wanted}</div>
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
    if (!detail) { window.showNotif('Token details not loaded', 'error'); return; }
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
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Price</span><span class="font-bold text-up">${window.formatPrice(detail.price_paxi)} PAXI</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">MCap</span><span class="font-bold">${window.formatAmount(detail.market_cap)} PAXI</span></div>
                        <div class="flex justify-between text-xs"><span class="text-gray-500">Liquidity</span><span class="font-bold text-blue-400">${window.formatAmount(detail.liquidity)} PAXI</span></div>
                    </div>
                </div>
                <div class="bg-bg rounded-xl p-4 border border-border">
                    <h4 class="text-xs font-bold text-gray-500 uppercase mb-2">Contract Address</h4>
                    <div class="flex items-center gap-2"><code class="text-xs text-gray-400 font-mono flex-1 break-all">${address}</code><button onclick="window.copyAddress(event, '${address}')" class="px-3 py-1 bg-card border border-border rounded text-[10px] font-bold hover:text-up transition-all">COPY</button></div>
                </div>
                <button onclick="window.selectPRC20('${address}'); this.closest('.fixed').remove();" class="w-full py-4 btn-trade rounded-xl font-black text-sm uppercase tracking-widest shadow-glow-up">Trade This Token</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};
