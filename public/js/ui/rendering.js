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
          subTabs.className = 'flex gap-2 p-3 overflow-x-auto no-scrollbar bg-meme-surface border-b-4 border-black mb-0 sticky top-0 z-10';
          container.prepend(subTabs);
      }
      const subTabsHtml = `
            <button onclick="window.setSubSort('all')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'all' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">ALL</button>
            <button onclick="window.setSubSort('new')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'new' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">NEW</button>
            <button onclick="window.setSubSort('gainer')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'gainer' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">WIN</button>
            <button onclick="window.setSubSort('hot')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'hot' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">HOT</button>
            <button onclick="window.setSubSort('marketcap')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'marketcap' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">MCAP</button>
            <button onclick="window.setSubSort('verified')" class="px-4 py-1 border-2 border-black font-display text-[10px] uppercase italic transition-all ${window.currentSubSort === 'verified' ? 'bg-meme-green text-black shadow-brutal' : 'bg-black text-gray-500 hover:text-white'}">VIBE</button>
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
    empty.className = 'text-center text-gray-600 py-12 empty-state font-display text-xl uppercase italic';
    empty.textContent = 'Zero Apes Found';
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
      const currentChildren = Array.from(container.children).filter(c => c.classList.contains('token-sidebar-item'));
      const expectedIndex = index;

      if (currentChildren[expectedIndex] !== el) {
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
          pager.className = 'p-8 flex justify-center w-full bg-meme-surface border-t-4 border-black';
          container.appendChild(pager);
      }
      const pagerHtml = `<button id="loadMoreTokensBtn" onclick="window.loadMoreTokens('${filter}')" class="px-8 py-3 bg-meme-cyan text-black border-4 border-black font-display text-lg uppercase italic shadow-brutal hover:shadow-none transition-all">LOAD MORE CRAP</button>`;
      if (pager.innerHTML !== pagerHtml) pager.innerHTML = pagerHtml;
  } else {
      if (pager) pager.remove();

      let endMarker = document.getElementById('tokenEndMarker');
      if (filtered.length > 0) {
          if (!endMarker) {
              endMarker = document.createElement('div');
              endMarker.id = 'tokenEndMarker';
              endMarker.className = 'py-8 text-center font-mono text-[8px] text-gray-700 uppercase font-black tracking-[0.4em] bg-meme-surface border-t-4 border-black';
              endMarker.textContent = 'END OF SHITCOIN LIST';
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
    el.className = 'token-sidebar-item p-4 flex items-center gap-4 cursor-pointer border-b-2 border-black hover:bg-meme-surface transition-colors';
    el.setAttribute('data-token', addr);
    el.onclick = () => window.selectPRC20(addr);

    // Initial skeleton
    el.innerHTML = `
        <div class="relative flex-shrink-0">
            <div class="token-logo-container w-12 h-12 bg-meme-card border-4 border-black flex items-center justify-center text-xl font-display text-gray-700 shadow-brutal rotate-[-5deg]">?</div>
            <div class="pump-indicator absolute -top-1 -right-1 w-4 h-4 bg-meme-green rounded-full border-2 border-black animate-pulse hidden"></div>
            <div class="verified-indicator absolute -bottom-1 -right-1 text-meme-cyan bg-black rounded-full shadow-lg hidden"><i class="fas fa-check-circle"></i></div>
        </div>
        <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between gap-2 mb-1">
                <span class="token-symbol font-display text-xl text-white italic truncate uppercase">...</span>
                <span class="token-change font-mono text-[10px] font-bold text-gray-600 bg-black px-1">0.00%</span>
            </div>
            <div class="flex items-center justify-between font-mono text-[9px] text-gray-600 font-bold uppercase tracking-tight">
                <span class="token-name truncate max-w-[80px]">Loading...</span>
                <div class="flex flex-col items-end">
                    <span class="token-mcap text-meme-yellow">MCAP -</span>
                    <span class="token-liq text-meme-cyan">LIQ -</span>
                </div>
            </div>
        </div>
        <button class="info-btn p-2 text-gray-700 hover:text-meme-green transition-colors">
            <i class="fas fa-info-circle text-lg"></i>
        </button>
    `;

    el.querySelector('.info-btn').onclick = (e) => {
        e.stopPropagation();
        window.showTokenDetail(e, addr);
    };

    return el;
};

// ===== PATCH TOKEN ELEMENT =====
window.patchTokenElement = function(el, addr) {
    const detail = window.tokenDetails.get(addr);
    if (!detail) return;

    const isActive = window.currentPRC20 === addr;
    if (isActive) {
        el.classList.add('bg-meme-surface', 'border-l-8', 'border-meme-green');
    } else {
        el.classList.remove('bg-meme-surface', 'border-l-8', 'border-meme-green');
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
    const priceChange = window.numtokenlist(detail.price_change_24h);
    const changeText = `${priceChange >= 0 ? '+' : ''}${(priceChange * 100).toFixed(2)}%`;
    if (changeEl.textContent !== changeText) {
        changeEl.textContent = changeText;
        changeEl.className = `token-change font-mono text-[10px] font-bold bg-black px-1 ${priceChange >= 0 ? 'text-meme-green' : 'text-meme-pink'}`;
    }

    // Update MCap
    const mcapEl = el.querySelector('.token-mcap');
    const mcapUsd = window.numtokenlist(detail.market_cap_usd);
    const mcapText = `MCAP $${window.formatAmount(mcapUsd)}`;
    if (mcapEl.textContent !== mcapText) mcapEl.textContent = mcapText;

    // Update Liquidity
    const liqEl = el.querySelector('.token-liq');
    const liqUsd = window.numtokenlist(detail.liquidity_usd);
    const liqText = `LIQ $${window.formatAmount(liqUsd)}`;
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
            img.className = 'w-12 h-12 border-4 border-black rotate-[5deg] group-hover:rotate-0 transition-transform';
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
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> GULPING DATA...'; }
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
    gainers.forEach(t => { html += `<span class="text-black font-display text-lg mx-8 italic uppercase">GAINER: ${t.symbol} <span class="text-white bg-black px-2">+${(t.price_change_24h * 100).toFixed(2)}%</span></span>`; });
    hot.forEach(t => { html += `<span class="text-black font-display text-lg mx-8 italic uppercase">HOT: ${t.symbol} <span class="text-white bg-black px-2">VOL ${window.formatAmount(t.volume_24h)}</span></span>`; });
    // Duplicate for loop
    html += html;
    window.setHtml(tickerContainer, html);
};

// ===== RENDER SWAP TERMINAL =====
window.renderSwapTerminal = async function() {
    let container = document.getElementById('mainSwapTerminal');
    const mainWrapper = document.getElementById('mainSwapContainer');

    if (!container) {
        container = document.getElementById('sidebarContent');
    }

    if (!container) return;

    if (!window.wallet) {
        if (mainWrapper) {
            mainWrapper.classList.add('hidden');
        }

        if (container && container.id === 'sidebarContent') {
            container.innerHTML = `
                <div class="text-center py-32 flex flex-col items-center">
                    <div class="w-20 h-20 bg-meme-card border-4 border-black shadow-brutal flex items-center justify-center text-gray-700 text-4xl mb-8 rotate-[-10deg]">
                        <i class="fas fa-lock"></i>
                    </div>
                    <p class="font-display text-2xl text-gray-600 uppercase italic">Terminal Locked</p>
                    <p class="font-mono text-[10px] text-gray-700 mt-2 font-bold uppercase tracking-[0.2em]">Connect wallet to access degen tools</p>
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
        <div class="flex flex-col gap-6 animate-fade-in max-w-full overflow-hidden">
            ${isWatchOnly ? `
                <div class="p-4 bg-meme-yellow border-4 border-black shadow-brutal flex items-center gap-4 mb-2 rotate-[1deg]">
                    <i class="fas fa-eye text-black text-2xl"></i>
                    <div class="font-display text-xl text-black uppercase italic leading-none">
                        WATCH-ONLY MODE: <span class="text-white drop-shadow-[2px_2px_0_rgba(0,0,0,1)]">VIEW ONLY TERMINAL</span>
                    </div>
                </div>
            ` : ''}
            <div class="flex bg-black p-2 border-4 border-black shadow-brutal-lg rotate-[-1deg]">
                <button onclick="window.setSwapMode('buy')" id="buyTab" class="flex-1 py-3 font-display text-2xl transition-all uppercase italic ${isBuy ? 'bg-meme-green text-black shadow-brutal' : 'text-gray-600'}">BUY</button>
                <button onclick="window.setSwapMode('sell')" id="sellTab" class="flex-1 py-3 font-display text-2xl transition-all uppercase italic ${!isBuy ? 'bg-meme-pink text-white shadow-brutal' : 'text-gray-600'}">SELL</button>
            </div>
            <div class="space-y-6">
                <div class="bg-meme-surface p-6 border-4 border-black shadow-brutal">
                    <div class="flex justify-between font-mono text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest">
                        YOU PAY <span onclick="window.setMaxPay()" class="cursor-pointer hover:text-meme-cyan flex items-center gap-2"><i class="fas fa-wallet text-meme-cyan"></i> <span id="payBalance" class="text-white font-mono">0.00</span></span>
                    </div>
                    <div class="flex items-center gap-4">
                        <input type="number" id="tradePayAmount" placeholder="0.0" class="bg-transparent text-5xl font-display outline-none w-full text-white placeholder-gray-900 italic" oninput="window.updateTradeOutput()">
                        <div class="px-4 py-2 bg-black border-4 border-black font-display text-2xl text-meme-yellow rotate-[5deg] whitespace-nowrap" id="payTokenSymbol">${isBuy ? 'PAXI' : symbol}</div>
                    </div>
                    <div class="flex gap-2 mt-6">
                        <button onclick="window.setPercentAmount(25)" class="flex-1 py-2 bg-black border-2 border-black font-display text-xs text-gray-500 hover:text-white hover:bg-meme-card transition-all italic">25%</button>
                        <button onclick="window.setPercentAmount(50)" class="flex-1 py-2 bg-black border-2 border-black font-display text-xs text-gray-500 hover:text-white hover:bg-meme-card transition-all italic">50%</button>
                        <button onclick="window.setPercentAmount(75)" class="flex-1 py-2 bg-black border-2 border-black font-display text-xs text-gray-500 hover:text-white hover:bg-meme-card transition-all italic">75%</button>
                        <button onclick="window.setPercentAmount(100)" class="flex-1 py-2 bg-black border-2 border-black font-display text-xs text-gray-500 hover:text-white hover:bg-meme-card transition-all italic">MAX</button>
                    </div>
                </div>

                <div class="flex justify-center -my-10 relative z-10">
                    <button onclick="window.reverseTradePair()" class="w-14 h-14 bg-meme-cyan border-4 border-black shadow-brutal flex items-center justify-center hover:rotate-180 transition-all duration-500 group rotate-[-10deg]">
                        <i class="fas fa-arrow-down text-2xl text-black group-hover:scale-125"></i>
                    </button>
                </div>

                <div class="bg-meme-surface p-6 border-4 border-black shadow-brutal">
                    <div class="flex justify-between font-mono text-[10px] font-bold text-gray-500 mb-4 uppercase tracking-widest">
                        YOU GET <span id="recvBalContainer" class="flex items-center gap-2"><i class="fas fa-coins text-meme-pink"></i> <span id="recvBalance" class="text-white font-mono">0.00</span></span>
                    </div>
                    <div class="flex items-center gap-4">
                        <input type="number" id="tradeRecvAmount" placeholder="0.0" class="bg-transparent text-5xl font-display outline-none w-full text-gray-800 italic" readonly>
                        <div class="px-4 py-2 bg-black border-4 border-black font-display text-2xl text-meme-pink rotate-[-5deg] whitespace-nowrap" id="recvTokenSymbol">${isBuy ? symbol : 'PAXI'}</div>
                    </div>
                </div>

                <div class="p-6 bg-black border-4 border-black shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] space-y-4">
                    <div class="flex justify-between font-mono text-[10px] font-bold uppercase tracking-tighter"><span class="text-gray-600">Exchange Rate</span><span id="tradeRate" class="text-meme-green italic">1 PAXI = 0 ${symbol}</span></div>
                    <div class="flex justify-between font-mono text-[10px] font-bold uppercase tracking-tighter"><span class="text-gray-600">Min Guaranteed</span><span id="minRecv" class="text-white italic">0.00 ${isBuy ? symbol : 'PAXI'}</span></div>
                    <div class="flex justify-between font-mono text-[10px] font-bold uppercase tracking-tighter"><span class="text-gray-600">Price Impact</span><span id="priceImpact" class="text-meme-green italic">0.00%</span></div>
                    <div class="flex justify-between font-mono text-[10px] font-bold uppercase tracking-tighter"><span class="text-gray-600">Slippage Tolerance</span><button onclick="window.showSlippageModal()" class="text-meme-pink hover:underline flex items-center gap-2 italic uppercase"><span id="slippageVal">${currentSlippage.toFixed(1)}%</span> <i class="fas fa-cog text-xs"></i></button></div>
                    <div class="flex justify-between font-mono text-[10px] font-bold uppercase tracking-tighter pt-3 border-t-2 border-meme-surface"><span class="text-gray-600">System Fee</span><span id="networkFee" class="text-meme-yellow italic">~0.0063 PAXI</span></div>
                </div>

                <button onclick="${isWatchOnly ? '' : 'window.executeTrade()'}"
                        ${isWatchOnly ? 'disabled' : ''}
                        class="w-full py-6 ${isBuy ? 'bg-meme-green text-black shadow-brutal-green' : 'bg-meme-pink text-white shadow-brutal-pink'} font-display text-4xl uppercase italic border-4 border-black transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-none hover:translate-x-2 hover:translate-y-2">
                    ${isWatchOnly ? 'WATCH-ONLY MODE' : (isBuy ? 'PUMP IT NOW' : 'DUMP IT NOW')}
                </button>
            </div>
        </div>`;
    
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
    container.innerHTML = `<div class="space-y-6">
        <h4 class="font-display text-2xl text-gray-500 uppercase italic border-b-4 border-black pb-4 flex justify-between items-center tracking-tighter">BATTLE LOGS<button onclick="window.renderTransactionHistorySidebar()" class="text-meme-cyan hover:rotate-180 transition-transform"><i class="fas fa-sync-alt"></i></button></h4>
        <div id="sidebar-tx-list" class="space-y-4"><div class="text-center py-20"><div class="w-12 h-12 border-4 border-meme-green border-t-transparent rounded-full animate-spin mx-auto"></div></div></div>
        <div id="tx-load-more" class="pt-6 flex justify-center"></div>
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
        listContainer.innerHTML = '<div class="text-center py-20 text-gray-700 font-display text-xl uppercase italic">No Battles Logged</div>';
        if (sentinelContainer) sentinelContainer.innerHTML = ''; return;
    }
    const html = history.map(tx => {
        const timeStr = new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const typeColor = tx.type === 'Swap' ? 'text-meme-green' : (tx.type === 'Transfer' ? 'text-meme-cyan' : 'text-gray-500');
        const icon = tx.type === 'Swap' ? 'fa-exchange-alt' : 'fa-paper-plane';
        return `<div class="bg-meme-surface border-4 border-black p-4 hover:bg-meme-card transition-colors cursor-pointer shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1" onclick="window.showTransactionDetailModal('${tx.hash}')">
            <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-black border-2 border-black flex items-center justify-center ${typeColor} rotate-[-5deg]"><i class="fas ${icon} text-sm"></i></div>
                    <div><div class="font-display text-lg uppercase italic ${typeColor}">${tx.type}</div><div class="font-mono text-[10px] font-bold text-gray-500 mt-0.5 tracking-tighter">${tx.amount.toFixed(4)} ${tx.denom === 'upaxi' ? 'PAXI' : tx.symbol || tx.denom}</div></div>
                </div>
                <div class="text-right">
                    <div class="font-mono text-[9px] text-gray-700 font-bold uppercase">HASH: ${tx.hash.slice(0, 8)}...</div>
                    <div class="font-display text-xs text-meme-yellow italic mt-1">${timeStr}</div>
                </div>
            </div>
        </div>`;
    }).join('');
    if (isInitial) { listContainer.innerHTML = html; } else { listContainer.insertAdjacentHTML('beforeend', html); }
    if (sentinelContainer) {
        if (!window.historyIsEnd) {
            sentinelContainer.innerHTML = `<button onclick="window.loadMoreHistory()" class="px-8 py-2 bg-black border-4 border-black text-white font-display text-lg uppercase italic shadow-brutal hover:shadow-none transition-all">LOAD MORE LOGS</button>`;
        } else {
            sentinelContainer.innerHTML = `<span class="font-mono text-[8px] text-gray-800 uppercase font-black tracking-[0.4em] py-4">END OF LOGS</span>`;
        }
    }
};

window.loadMoreHistory = async function() {
    window.historyPage++;
    await window.renderTxHistoryItems(false);
};

// ===== RENDER LP TERMINAL =====
window.renderLPTerminal = async function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;

    if (window.fetchPoolData) { await window.fetchPoolData(); }
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <h4 class="font-display text-2xl text-gray-500 uppercase italic border-b-4 border-black pb-4 tracking-tighter">LP PROTOCOL</h4>
            <div class="bg-meme-surface p-6 border-4 border-black shadow-brutal space-y-8">
                <div>
                    <div class="flex justify-between font-mono text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">PAXI DEPOSIT <span class="text-meme-green">BAL: <span id="lpPaxiBalance" class="text-white">0.00</span></span></div>
                    <div class="bg-black border-4 border-black p-4 mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <input type="number" id="lpPaxiAmount" placeholder="0.0" class="bg-transparent w-full text-white font-display text-3xl italic outline-none" oninput="window.updateLPFromInput('paxi')">
                    </div>
                    <input type="range" id="lpPaxiSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-black border-2 border-black rounded-full appearance-none cursor-pointer accent-meme-green" oninput="window.updateLPFromSlider('paxi', this.value)">
                </div>
                <div class="text-center"><i class="fas fa-plus text-meme-yellow text-2xl"></i></div>
                <div>
                    <div class="flex justify-between font-mono text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">${symbol} DEPOSIT <span class="text-meme-cyan">BAL: <span id="lpTokenBalance" class="text-white">0.00</span></span></div>
                    <div class="bg-black border-4 border-black p-4 mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <input type="number" id="lpTokenAmount" placeholder="0.0" class="bg-transparent w-full text-white font-display text-3xl italic outline-none" oninput="window.updateLPFromInput('token')">
                    </div>
                    <input type="range" id="lpTokenSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-black border-2 border-black rounded-full appearance-none cursor-pointer accent-meme-cyan" oninput="window.updateLPFromSlider('token', this.value)">
                </div>
                <div id="estimatedLP" class="font-display text-xl text-meme-green text-center italic h-8 animate-pulse"></div>
                <button onclick="window.executeAddLP()" class="w-full py-5 bg-meme-green text-black font-display text-3xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">Incorporate LP</button>
            </div>

            <div class="bg-black border-4 border-black p-6 shadow-brutal rotate-[1deg] space-y-4">
                <h5 class="font-display text-xl text-meme-cyan uppercase italic mb-4">CURRENT POSITION</h5>
                <div class="flex justify-between font-mono text-xs"><span class="text-gray-600 font-bold uppercase tracking-widest">LP TOKENS</span><span id="yourLPTokens" class="font-display text-2xl text-white italic">0.00</span></div>
                <div class="flex justify-between font-mono text-xs"><span class="text-gray-600 font-bold uppercase tracking-widest">POOL RATIO</span><span id="poolRatioDisplay" class="font-mono text-xs text-meme-yellow font-bold italic">-</span></div>
                <div id="yourPositionDetails" class="pt-2 border-t-2 border-meme-surface"></div>
            </div>

            <div class="bg-meme-surface border-4 border-black p-6 shadow-brutal-pink rotate-[-1deg] space-y-6">
                <h5 class="font-display text-xl text-meme-pink uppercase italic mb-4">LIQUIDITY EXIT</h5>
                <div class="bg-black border-4 border-black p-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                    <input type="number" id="lpRemoveAmount" placeholder="0.00" class="bg-transparent w-full text-white font-display text-3xl italic outline-none" oninput="window.updateRemoveLPFromInput()">
                </div>
                <input type="range" id="lpRemoveSlider" min="0" max="100" step="1" value="0" class="w-full h-2 bg-black border-2 border-black rounded-full appearance-none cursor-pointer accent-meme-pink" oninput="window.updateRemoveLPFromSlider(this.value)">
                <button onclick="window.executeRemoveLP()" class="w-full py-4 bg-black border-4 border-black text-meme-pink font-display text-2xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all uppercase italic">Dissolve Position</button>
            </div>
        </div>`;

    if (window.updateLPBalances) { window.updateLPBalances(); }
};

// ===== RENDER SEND TERMINAL =====
window.renderSendTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <h4 class="font-display text-2xl text-gray-500 uppercase italic border-b-4 border-black pb-4 tracking-tighter">ASSET DISPATCH</h4>
            <div class="bg-meme-surface p-6 border-4 border-black shadow-brutal space-y-8">
                <div>
                    <label class="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">RECIPIENT ADDRESS</label>
                    <div class="bg-black border-4 border-black p-4 mt-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                        <input type="text" id="sendRecipient" placeholder="paxi1..." class="bg-transparent w-full text-white font-mono text-xs outline-none">
                    </div>
                </div>
                <div class="flex flex-col gap-6">
                    <div>
                        <label class="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">DISPATCH AMOUNT</label>
                        <div class="bg-black border-4 border-black p-4 mt-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                            <input type="number" id="sendAmount" placeholder="0.0" class="bg-transparent w-full text-white font-display text-3xl italic outline-none">
                        </div>
                    </div>
                    <div>
                        <label class="font-mono text-[10px] text-gray-500 font-bold uppercase tracking-widest ml-1">SELECT ASSET</label>
                        <select id="sendTokenSelect" class="bg-black border-4 border-black p-4 w-full text-meme-cyan font-display text-2xl uppercase italic mt-2 outline-none shadow-brutal cursor-pointer">
                            <option value="upaxi">PAXI</option>
                        </select>
                    </div>
                </div>
                <button onclick="window.executeSend()" class="w-full py-6 bg-meme-cyan text-black font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">Execute Dispatch</button>
            </div>
        </div>`;
    window.populateSendTokens();
};

// ===== RENDER BURN TERMINAL =====
window.renderBurnTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    const symbol = window.currentTokenInfo?.symbol || 'TOKEN';
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <h4 class="font-display text-2xl text-gray-500 uppercase italic border-b-4 border-black pb-4 tracking-tighter">INCINERATOR</h4>
            <div class="bg-meme-pink/10 p-8 border-4 border-black shadow-brutal-pink text-center relative overflow-hidden">
                <div class="absolute -top-10 -right-10 w-32 h-32 bg-meme-pink opacity-20 blur-3xl rounded-full animate-pulse"></div>
                <i class="fas fa-fire text-6xl text-meme-pink mb-6 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]"></i>
                <p class="font-display text-xl text-white italic leading-tight mb-8 uppercase">Permanently remove assets from the market supply.</p>
                <div class="bg-black border-4 border-black p-6 mb-8 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] text-left">
                    <div class="flex justify-between font-mono text-[10px] font-bold text-gray-600 mb-2 uppercase">BURN AMOUNT (${symbol}) <span id="burnBalance" class="text-meme-pink">BAL: 0.00</span></div>
                    <input type="number" id="burnAmount" placeholder="0.0" class="bg-transparent w-full text-white font-display text-4xl outline-none italic" oninput="window.updateBurnSliderFromInput()">
                    <input type="range" id="burnSlider" min="0" max="100" step="1" value="0" class="w-full mt-6 h-2 bg-black border-2 border-black rounded-full appearance-none cursor-pointer accent-meme-pink" oninput="window.setBurnPercent(this.value)">
                </div>
                <button onclick="window.executeBurn()" class="w-full py-6 bg-meme-pink text-white font-display text-4xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">Ignite The Fire</button>
            </div>
        </div>`;
    window.updateBurnBalanceDisplay();
};

// ===== RENDER DONATE TERMINAL =====
window.renderDonateTerminal = function() {
    const container = document.getElementById('sidebarContent');
    if (!container) return;
    container.innerHTML = `
        <div class="space-y-8 animate-fade-in">
            <h4 class="font-display text-2xl text-gray-500 uppercase italic border-b-4 border-black pb-4 tracking-tighter">SUPPORT THE HUSTLE</h4>
            <div class="bg-meme-yellow p-8 border-4 border-black shadow-brutal text-center rotate-[1deg]">
                <i class="fas fa-heart text-6xl text-black mb-6 animate-float"></i>
                <p class="font-display text-2xl text-black italic leading-tight mb-8 uppercase">Help us build the most unhinged DEX on Paxi Network.</p>
                <div class="bg-black border-4 border-black p-6 mb-8 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)] text-left rotate-[-2deg]">
                    <div class="font-mono text-[10px] font-bold text-gray-600 mb-2 uppercase tracking-widest">DONATION AMOUNT (PAXI)</div>
                    <input type="number" id="donationAmount" value="10" class="bg-transparent w-full text-white font-display text-4xl outline-none italic">
                </div>
                <button onclick="window.executeDonation()" class="w-full py-6 bg-black text-meme-yellow font-display text-4xl border-4 border-black shadow-brutal-yellow hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">Ape In To Devs</button>
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
    if (!data || !data.tx_response) return;

    const tx = data.tx_response;
    const body = data.tx.body;
    const timeStr = new Date(tx.timestamp).toLocaleString();
    const statusColor = tx.code === 0 ? 'text-meme-green' : 'text-meme-pink';
    const statusText = tx.code === 0 ? 'SUCCESS' : 'FAILED';

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/98 z-[600] flex items-center justify-center p-6 animate-fade-in overflow-y-auto no-scrollbar';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    let messagesHtml = body.messages.map((m, i) => {
        const typeShort = m['@type'].split('.').pop();
        return `<div class="p-6 bg-black border-4 border-black mb-4 shadow-brutal rotate-[0.5deg]">
            <div class="font-display text-xl text-meme-cyan uppercase italic mb-4">MESSAGE #${i+1}: ${typeShort}</div>
            <pre class="font-mono text-[10px] text-gray-500 overflow-x-auto selection:bg-meme-cyan selection:text-black">${JSON.stringify(m, null, 2)}</pre>
        </div>`;
    }).join('');

    modal.innerHTML = `
        <div class="bg-meme-surface border-4 border-black w-full max-w-3xl rounded-[3rem] overflow-hidden shadow-brutal-lg flex flex-col my-8">
            <div class="p-8 border-b-4 border-black flex justify-between items-center bg-black">
                <h3 class="text-4xl font-display text-white italic uppercase tracking-tighter">BATTLE REPORT</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-meme-pink hover:scale-125 transition-transform"><i class="fas fa-times text-2xl"></i></button>
            </div>
            <div class="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar bg-meme-surface">
                <div class="grid grid-cols-2 gap-6">
                    <div class="p-6 bg-black border-4 border-black shadow-brutal">
                        <div class="font-mono text-[10px] text-gray-600 uppercase font-black mb-2 tracking-widest">Log Status</div>
                        <div class="text-3xl font-display italic uppercase ${statusColor}">${statusText}</div>
                    </div>
                    <div class="p-6 bg-black border-4 border-black shadow-brutal">
                        <div class="font-mono text-[10px] text-gray-600 uppercase font-black mb-2 tracking-widest">Block Height</div>
                        <div class="text-3xl font-display text-white italic uppercase">${tx.height}</div>
                    </div>
                </div>

                <div class="p-6 bg-black border-4 border-black shadow-brutal">
                    <div class="font-mono text-[10px] text-gray-600 uppercase font-black mb-2 tracking-widest">Transaction Hash</div>
                    <div class="flex items-center gap-4">
                        <code class="font-mono text-xs text-meme-green flex-1 truncate">${hash}</code>
                        <button onclick="window.copyAddress(event, '${hash}')" class="text-meme-yellow hover:scale-110 transition-transform"><i class="fas fa-copy text-xl"></i></button>
                    </div>
                </div>

                <div class="p-6 bg-black border-4 border-black shadow-brutal">
                    <div class="font-mono text-[10px] text-gray-600 uppercase font-black mb-2 tracking-widest">Dispatch Time</div>
                    <div class="font-display text-2xl text-white italic uppercase">${timeStr}</div>
                </div>

                <div>
                    <h4 class="font-display text-3xl text-gray-600 uppercase italic tracking-tighter mb-6">RAW PAYLOADS</h4>
                    ${messagesHtml}
                </div>

                <div class="p-6 bg-black border-4 border-black shadow-brutal">
                    <div class="font-mono text-[10px] text-gray-600 uppercase font-black mb-2 tracking-widest">Gas Used vs Wanted</div>
                    <div class="font-display text-2xl text-white italic uppercase">${tx.gas_used} / ${tx.gas_wanted}</div>
                </div>

                ${tx.raw_log && tx.code !== 0 ? `
                    <div class="p-8 bg-meme-pink/10 border-4 border-meme-pink shadow-brutal-pink">
                        <div class="font-display text-2xl text-meme-pink uppercase italic mb-4">SYSTEM FAILURE LOG</div>
                        <div class="font-mono text-xs text-meme-pink/80 font-bold uppercase leading-relaxed break-words">${tx.raw_log}</div>
                    </div>
                ` : ''}
            </div>
            <div class="p-8 border-t-4 border-black bg-black flex gap-6">
                <a href="https://winscan.winsnip.xyz/tx/${hash}" target="_blank" class="flex-1 py-5 bg-meme-green text-black border-4 border-black font-display text-3xl uppercase italic text-center shadow-brutal hover:shadow-none transition-all">DEEP SCAN</a>
                <button onclick="this.closest('.fixed').remove()" class="flex-1 py-5 bg-meme-surface text-white border-4 border-black font-display text-3xl uppercase italic shadow-brutal hover:shadow-none">DISMISS</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};

// ===== SHOW TOKEN DETAIL MODAL =====
window.showTokenDetail = function(event, address) {
    event.stopPropagation();
    const detail = window.tokenDetails.get(address);
    if (!detail) return;
    const totalSupply = detail.total_supply ? (parseInt(detail.total_supply) / Math.pow(10, detail.decimals)).toLocaleString() : 'N/A';
    const safeName = window.escapeHtml(detail.name);
    const safeSymbol = window.escapeHtml(detail.symbol);
    const safeDescription = window.escapeHtml(detail.description);
    const safeProject = window.escapeHtml(detail.project);

    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 animate-fade-in overflow-y-auto no-scrollbar';
    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };

    modal.innerHTML = `
        <div class="bg-meme-surface border-4 border-black shadow-brutal-lg max-w-3xl w-full rounded-[3rem] overflow-hidden my-8">
            <div class="p-8 border-b-4 border-black flex justify-between items-center sticky top-0 bg-meme-cyan z-10">
                <h3 class="text-4xl font-display text-black italic uppercase tracking-tighter">SHITCOIN INTEL</h3>
                <div class="flex gap-4">
                    <button onclick="window.shareToken('${address}')" class="text-black hover:scale-125 transition-transform"><i class="fas fa-share-alt text-2xl"></i></button>
                    <button onclick="this.closest('.fixed').remove()" class="text-black hover:rotate-90 transition-transform"><i class="fas fa-times text-2xl"></i></button>
                </div>
            </div>
            <div class="p-8 space-y-8 bg-meme-surface">
                <div class="flex flex-col md:flex-row items-center gap-8 mb-4">
                    <div class="relative rotate-[-5deg]">
                        ${detail.logo ? `<img src="${detail.logo}" class="w-32 h-32 border-4 border-black shadow-brutal" alt="${safeName}">` : `<div class="w-32 h-32 bg-meme-pink border-4 border-black shadow-brutal flex items-center justify-center text-white font-display text-6xl">${safeSymbol.charAt(0)}</div>`}
                        <div class="absolute -bottom-4 -right-4 w-12 h-12 bg-meme-green border-4 border-black flex items-center justify-center text-black rotate-[15deg] animate-bounce">${detail.verified ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-skull"></i>'}</div>
                    </div>
                    <div class="text-center md:text-left">
                        <h2 class="text-6xl font-display text-white italic tracking-tighter uppercase leading-none mb-4">${safeName}</h2>
                        <span class="px-6 py-2 bg-black border-2 border-black text-meme-cyan font-display text-2xl italic uppercase shadow-brutal">${safeSymbol}</span>
                    </div>
                </div>

                ${detail.description ? `
                    <div class="bg-black border-4 border-black p-6 shadow-[inset_0_4px_8px_rgba(0,0,0,0.5)]">
                        <h4 class="font-mono text-[10px] font-black text-gray-600 uppercase mb-3 tracking-widest">MISSION BRIEFING</h4>
                        <p class="font-display text-2xl text-gray-300 leading-tight italic uppercase">${safeDescription}</p>
                    </div>
                ` : ''}

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-meme-card border-4 border-black p-6 shadow-brutal rotate-[-1deg]">
                        <h4 class="font-display text-2xl text-meme-yellow uppercase italic mb-6 border-b-2 border-black pb-2">TOKEN SPECS</h4>
                        <div class="space-y-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                            <div class="flex justify-between"><span class="text-gray-600">Total Supply</span><span class="text-white">${totalSupply}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Precision</span><span class="text-white">${detail.decimals}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Total Apes</span><span class="text-white">${detail.holders.toLocaleString()}</span></div>
                        </div>
                    </div>
                    <div class="bg-meme-card border-4 border-black p-6 shadow-brutal rotate-[1deg]">
                        <h4 class="font-display text-2xl text-meme-green uppercase italic mb-6 border-b-2 border-black pb-2">MARKET RADAR</h4>
                        <div class="space-y-3 font-mono text-[10px] font-bold uppercase tracking-widest">
                            <div class="flex justify-between"><span class="text-gray-600">Price</span><span class="text-meme-green italic font-display text-xl">$${window.formatPrice(detail.price_usd)}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Market Cap</span><span class="text-white font-display text-xl">$${window.formatAmount(detail.market_cap_usd)}</span></div>
                            <div class="flex justify-between"><span class="text-gray-600">Pool Depth</span><span class="text-meme-cyan font-display text-xl">$${window.formatAmount(detail.liquidity_usd)}</span></div>
                        </div>
                    </div>
                </div>

                <div class="bg-black border-4 border-black p-6 shadow-brutal">
                    <h4 class="font-mono text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest text-center">CONTRACT CA</h4>
                    <div class="flex items-center gap-4 bg-meme-surface p-4 border-2 border-black">
                        <code class="font-mono text-xs text-meme-green flex-1 truncate">${address}</code>
                        <button onclick="window.copyAddress(event, '${address}')" class="bg-meme-yellow text-black px-4 py-2 border-2 border-black font-display text-lg italic shadow-brutal hover:shadow-none transition-all">COPY</button>
                    </div>
                </div>

                <button onclick="window.selectPRC20('${address}'); this.closest('.fixed').remove();" class="w-full py-8 bg-meme-pink text-white font-display text-5xl border-4 border-black shadow-brutal hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all uppercase italic">APE INTO ${safeSymbol}</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
};
