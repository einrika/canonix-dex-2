window.UIManager.registerUI('TokenSidebar', () => {
    return `
        <div class="p-2 bg-secondary border-b border-secondary">
            <div class="relative mb-2">
                <i class="fas fa-search absolute left-2 top-1/2 -translate-y-1/2 text-accent text-[10px]"></i>
                <input type="text" id="tokenSidebarSearch" placeholder="SEARCH..." class="w-full pl-7 pr-2 py-1.5 bg-secondary border border-secondary text-[10px] font-sans outline-none focus:border-accent transition-all text-primary-text placeholder:text-muted-text uppercase">
            </div>
            <div class="flex gap-1 overflow-x-auto no-scrollbar pb-1" id="token-sort-btns">
                <button data-sort="hot" class="sort-btn px-2 py-0.5 border border-secondary bg-accent text-black font-display text-[9px] shadow-brutal-sm hover:shadow-none transition-all uppercase">HOT</button>
                <button data-sort="new" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">NEW</button>
                <button data-sort="gainer" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">WIN</button>
                <button data-sort="marketcap" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">MCAP</button>
                <button data-sort="verified" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase">VERIFIED</button>
                <button data-sort="nonpump" class="sort-btn px-2 py-0.5 border border-secondary bg-secondary text-primary-text font-display text-[9px] shadow-brutal-sm hover:shadow-none hover:bg-accent hover:text-black transition-all uppercase whitespace-nowrap">NON-PUMP</button>
            </div>
        </div>
        <div id="tokenSidebarList" class="flex-1 overflow-y-auto no-scrollbar bg-bg">
            <div class="p-8 text-center text-muted-text">
                <div class="w-8 h-8 border border-meme-green border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p class="font-mono text-[8px] font-bold uppercase tracking-widest italic">Scanning...</p>
            </div>
        </div>
    `;
});

// ============================================
// TOKENSIDEBAR LOGIC
// ============================================

window.currentPRC20 = '';
window.tokenAddresses = [];
window.tokenDetails = new Map();
window.currentTokenInfo = null;
window.currentSort = 'hot';
window.currentSubSort = 'all';
window.displayLimit = 20;
window.currentContractPage = 0;
window.isFetchingMore = false;
window.myTokenBalances = new Map();
window.tokenBlockHeights = new Map();
window.hasMoreTokens = true;
window.totalTokensAvailable = 0;
window.isTokenSidebarLoading = false;
window.tokenElementMap = new Map();

window.UIManager.registerLogic('TokenSidebar', (container) => {
    container.querySelector('#tokenSidebarSearch')?.addEventListener('input', () => window.filterTokenSidebar());
    container.querySelectorAll('#token-sort-btns button').forEach(btn => {
        btn.addEventListener('click', (e) => window.setSort(btn.dataset.sort, e));
    });

    if (window.tokenAddresses && window.tokenAddresses.length > 0) {
        window.renderTokenSidebar();
    }
});

window.processTokenDetail = function(contractAddress, data) {
    const c = data.contract || data;
    const decimals = c.decimals || 6;
    const pricePaxi = c.processed ? c.price_paxi : (c.reserve_prc20 > 0 ? (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6) : 0);
    const mcapPaxi = c.processed ? c.market_cap : ((parseFloat(c.total_supply || 0) / Math.pow(10, decimals)) * pricePaxi);
    const liqPaxi = c.processed ? c.liquidity : ((parseFloat(c.reserve_paxi || 0) * 2) / 1000000);
    const marketCapUsd = mcapPaxi * (window.paxiPriceUSD || 0.05);
    const logo = window.normalizeLogoUrl(c.logo);
    return {
        id: c.id, address: contractAddress, name: c.name || 'Unknown', symbol: c.symbol || 'N/A', decimals: decimals,
        total_supply: c.total_supply, total_supply_num: c.total_supply_num || (parseFloat(c.total_supply || 0) / Math.pow(10, decimals)),
        logo: logo, description: c.desc || '', project: c.project || '', marketing: c.marketing || '', holders: parseInt(c.holders || 0, 10),
        liquidity: liqPaxi, liquidity_usd: liqPaxi * (window.paxiPriceUSD || 0.05), verified: c.official_verified === true,
        price_change_24h: parseFloat(c.price_change || 0), reserve_paxi: parseFloat(c.reserve_paxi || 0), reserve_prc20: parseFloat(c.reserve_prc20 || 0),
        price_paxi: pricePaxi, price_usd: pricePaxi * (window.paxiPriceUSD || 0.05), volume_24h: parseFloat(c.volume || 0),
        market_cap: mcapPaxi, market_cap_usd: marketCapUsd, buys: parseInt(c.buys || 0), sells: parseInt(c.sells || 0),
        is_pump: c.is_pump === true, txs_count: parseInt(c.txs_count || 0), created_at: c.created_at, website: c.project || '',
        minting_disabled: c.minting_disabled === true, official_verified: c.official_verified === true, marketing_wallet: c.marketing || '',
        high_24h: parseFloat(c.high_24h || 0), low_24h: parseFloat(c.low_24h || 0)
    };
};

window.isTokensLoaded = false;
window.loadTokensOptimized = async function() {
    const sidebar = document.getElementById('tokenSidebar');
    if (window.innerWidth >= 1024 || (sidebar && !sidebar.classList.contains('-translate-x-full'))) {
        if (!window.isTokensLoaded) {
            window.isTokensLoaded = true;
            await window.loadAllTokenAddresses();
            window.setupTokenSocketListeners();
        }
    }
};

window.setupTokenSocketListeners = function() {
    window.addEventListener('paxi_token_list_updated', (event) => {
        const data = event.detail;
        if (data && data.contracts) {
            data.contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                window.tokenDetails.set(c.contract_address, detail);
                if (!window.tokenAddresses.includes(c.contract_address)) window.tokenAddresses.push(c.contract_address);
            });
            if (window.renderTokenSidebar) window.renderTokenSidebar(window.currentTokenSearch || '');
            if (window.updateTicker) window.updateTicker();
            window.updateTokenCounter();
        }
    });
    window.addEventListener('paxi_price_updated_socket', (event) => {
        const data = event.detail;
        const currentDetail = window.tokenDetails.get(data.address);
        if (currentDetail) {
            const updated = { ...currentDetail, price_paxi: data.price_paxi, price_change_24h: data.price_change, reserve_paxi: data.reserve_paxi, reserve_prc20: data.reserve_prc20, volume_24h: data.volume_24h };
            const processed = window.processTokenDetail(data.address, updated);
            window.tokenDetails.set(data.address, processed);
            if (window.currentPRC20 === data.address && window.updateDashboard) window.updateDashboard(processed);
            if (window.updateTokenCard) window.updateTokenCard(data.address);
        }
    });
};

window.loadAllTokenAddresses = async function() {
    try {
        const url0 = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
        const data0 = await window.fetchDirect(url0, { cache: 'no-store' });
        if (!data0 || !data0.contracts) throw new Error('Invalid response from Explorer API');
        window.totalTokensAvailable = data0.total || data0.totals || 0;
        const newAddresses = [];
        data0.contracts.forEach(c => {
            const detail = window.processTokenDetail(c.contract_address, c);
            window.tokenDetails.set(c.contract_address, detail);
            newAddresses.push(c.contract_address);
        });
        window.tokenAddresses = newAddresses; window.currentContractPage = 0;
        window.hasMoreTokens = window.totalTokensAvailable > window.tokenAddresses.length;
        if (window.renderTokenSidebar && document.getElementById('tokenSidebarList')) window.renderTokenSidebar();
        if (document.getElementById('totalstoken')) window.updateTokenCounter();
    } catch (e) { console.error('Token load error:', e); if (window.renderTokenSidebar) window.renderTokenSidebar(); }
};

window.updateTokenCounter = function() {
    const counterEl = document.getElementById('totalstoken');
    if (counterEl) counterEl.textContent = `${window.tokenAddresses.length} of ${window.totalTokensAvailable || '?'}`;
};

window.fetchNextContractPage = async function() {
    if (window.isFetchingMore || !window.hasMoreTokens) return false;
    window.isFetchingMore = true;
    try {
        const targetPage = window.currentContractPage + 1;
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${targetPage}`;
        const data = await window.fetchDirect(url);
        if (!data || !data.contracts || data.contracts.length === 0) { window.hasMoreTokens = false; return false; }
        if (data.total || data.totals) window.totalTokensAvailable = data.total || data.totals;
        window.currentContractPage = targetPage;
        data.contracts.forEach(c => {
            const detail = window.processTokenDetail(c.contract_address, c);
            window.tokenDetails.set(c.contract_address, detail);
            if (!window.tokenAddresses.includes(c.contract_address)) window.tokenAddresses.push(c.contract_address);
        });
        window.hasMoreTokens = window.totalTokensAvailable > window.tokenAddresses.length;
        window.updateTokenCounter(); return window.hasMoreTokens;
    } catch (e) { console.error('Failed to fetch more tokens:', e); return false; }
    finally { window.isFetchingMore = false; }
};

window.loadTokenDetail = async function(contractAddress) {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-detail?address=${contractAddress}`;
        const data = await window.fetchDirect(url, { cache: 'no-store' });
        if (data && data.contract) {
            const detail = window.processTokenDetail(contractAddress, data);
            window.tokenDetails.set(contractAddress, detail); return detail;
        }
    } catch (e) { console.error('Error loading token detail:', e); }
    return null;
};

window.setSort = async function(sortType, event) {
    window.currentSort = sortType;
    document.querySelectorAll('.sort-btn').forEach(btn => { btn.classList.remove('bg-meme-green', 'text-black'); btn.classList.add('bg-surface', 'text-primary-text'); });
    if (event && event.currentTarget) { event.currentTarget.classList.add('bg-meme-green', 'text-black'); event.currentTarget.classList.remove('bg-surface', 'text-primary-text'); }
    if (sortType === 'nonpump') await window.loadNonPumpTokens();
    if (window.renderTokenSidebar) window.renderTokenSidebar();
};

window.loadNonPumpTokens = async function() {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0&type=nonpump`;
        const data = await window.fetchDirect(url);
        if (data && data.contracts) {
            data.contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                window.tokenDetails.set(c.contract_address, detail);
                if (!window.tokenAddresses.includes(c.contract_address)) window.tokenAddresses.push(c.contract_address);
            });
        }
    } catch (e) { console.error('Failed to load non-pump tokens:', e); }
};

window.searchTokensAPI = async function(query) {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?query=${encodeURIComponent(query)}`;
        const data = await window.fetchDirect(url);
        const contracts = data.contracts || (Array.isArray(data) ? data : []);
        if (contracts && contracts.length > 0) {
            contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                window.tokenDetails.set(c.contract_address, detail);
                if (!window.tokenAddresses.includes(c.contract_address)) window.tokenAddresses.unshift(c.contract_address);
            });
        }
    } catch (e) { console.warn('Search API call failed:', e); }
};

window.selectPRC20 = async function(contractAddress) {
    if (window.PaxiSocket && window.PaxiSocket.subscribeToken) window.PaxiSocket.subscribeToken(contractAddress);
    window.currentPRC20 = contractAddress; window.holdersPage = 1;
    localStorage.setItem('canonix_last_token', contractAddress);
    if (window.closeAllSidebars) window.closeAllSidebars();
    if (window.hideTokenSelector) window.hideTokenSelector();
    const url = new URL(window.location); url.searchParams.set('token', contractAddress); window.history.pushState({}, '', url);
    try {
        window.currentTokenInfo = await window.loadTokenDetail(contractAddress);
        if (!window.currentTokenInfo) return;
        if (window.refreshAllUI) await window.refreshAllUI();
        const shortName = window.currentTokenInfo?.symbol || contractAddress.slice(0, 8);
        window.setText('selectedPair', `${shortName}/PAXI`);
        const toSymbol = window.tradeType === 'buy' ? shortName : 'PAXI';
        const fromSymbol = window.tradeType === 'buy' ? 'PAXI' : shortName;
        window.setText('payTokenSymbol', fromSymbol); window.setText('recvTokenSymbol', toSymbol);
        if (window.currentTokenInfo.volume_24h) window.setText('volVal', window.currentTokenInfo.volume_24h.toFixed(2) + ' PAXI');
        if (window.poolData) window.startRealtimeUpdates();
        if (window.updateTokenCard) window.updateTokenCard(contractAddress);
    } catch (e) { console.error('Failed to load token:', e); }
};

window.renderTokenSidebar = function(filter = '', isAppend = false) {
  const container = document.getElementById('tokenSidebarList');
  if (!container) return;
  let filtered = [...window.tokenAddresses];
  Array.from(container.children).forEach(child => { if (child.id !== 'tokenSubTabs' && !child.classList.contains('token-sidebar-item') && child.id !== 'tokenPager' && child.id !== 'tokenEndMarker') child.remove(); });
  if (!filter) {
      switch (window.currentSort) {
        case 'nonpump': filtered = filtered.filter(addr => window.tokenDetails.get(addr)?.is_pump === false); break;
        case 'verified': filtered = filtered.filter(addr => window.tokenDetails.get(addr)?.verified === true); break;
      }
  } else {
    const lowerFilter = filter.toLowerCase();
    filtered = filtered.filter(addr => { const detail = window.tokenDetails.get(addr); return addr.toLowerCase().includes(lowerFilter) || (detail && (detail.name?.toLowerCase().includes(lowerFilter) || detail.symbol?.toLowerCase().includes(lowerFilter))); });
  }
  filtered.sort((a, b) => {
    const aDetail = window.tokenDetails.get(a); const bDetail = window.tokenDetails.get(b);
    if (!aDetail && !bDetail) return 0; if (!aDetail) return 1; if (!bDetail) return -1;
    const aVer = aDetail.verified ? 1 : 0; const bVer = bDetail.verified ? 1 : 0;
    if (aVer !== bVer) return bVer - aVer;
    if (filter) { const lowerFilter = filter.toLowerCase(); const aSym = aDetail.symbol?.toLowerCase() || ''; const bSym = bDetail.symbol?.toLowerCase() || ''; if (aSym === lowerFilter && bSym !== lowerFilter) return -1; if (bSym === lowerFilter && aSym !== lowerFilter) return 1; }
    const sortType = (window.currentSort === 'nonpump' && window.currentSubSort !== 'all') ? window.currentSubSort : window.currentSort;
    switch (sortType) {
      case 'new': if (aDetail.id && bDetail.id) return bDetail.id - aDetail.id; return new Date(bDetail.created_at) - new Date(aDetail.created_at);
      case 'marketcap': return window.numtokenlist(bDetail.market_cap) - window.numtokenlist(aDetail.market_cap);
      case 'gainer': return window.numtokenlist(bDetail.price_change_24h) - window.numtokenlist(aDetail.price_change_24h);
      case 'hot': default: return window.numtokenlist(bDetail.volume_24h) - window.numtokenlist(aDetail.volume_24h);
    }
  });
  let subTabs = document.getElementById('tokenSubTabs');
  if (window.currentSort === 'nonpump') {
      if (!subTabs) { subTabs = document.createElement('div'); subTabs.id = 'tokenSubTabs'; subTabs.className = 'flex gap-1 p-2 overflow-x-auto no-scrollbar bg-card/50 border-b border-border/50 mb-2 sticky top-0 z-10 backdrop-blur-sm'; container.prepend(subTabs); }
      const subTabsHtml = `
            <button onclick="window.setSubSort('all')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'all' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">ALL NON-PUMP</button>
            <button onclick="window.setSubSort('new')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'new' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">NEW</button>
            <button onclick="window.setSubSort('gainer')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'gainer' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">GAINER</button>
            <button onclick="window.setSubSort('hot')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'hot' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">HOT</button>
            <button onclick="window.setSubSort('marketcap')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'marketcap' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">MCAP</button>
            <button onclick="window.setSubSort('verified')" class="px-3 py-1 text-[9px] font-display border-2 border-card uppercase italic transition-all shadow-brutal-sm hover:shadow-none ${window.currentSubSort === 'verified' ? 'bg-meme-cyan text-black' : 'bg-surface text-primary-text hover:bg-meme-cyan/20'}">VERIFIED</button>`;
      if (subTabs.innerHTML !== subTabsHtml) subTabs.innerHTML = subTabsHtml;
  } else if (subTabs) subTabs.remove();
  if (!filtered.length) {
    Array.from(container.children).forEach(child => { if (child.id !== 'tokenSubTabs') child.remove(); });
    window.tokenElementMap.clear(); const empty = document.createElement('div'); empty.className = 'text-center text-secondary-text py-8 empty-state'; empty.textContent = 'No tokens found'; container.appendChild(empty); return;
  } else { const emptyState = container.querySelector('.empty-state'); if (emptyState) emptyState.remove(); }
  const displayList = filtered.slice(0, window.displayLimit); const targetIds = new Set(displayList);
  window.tokenElementMap.forEach((el, id) => { if (!targetIds.has(id)) { el.remove(); window.tokenElementMap.delete(id); } });
  displayList.forEach((addr, index) => {
      let el = window.tokenElementMap.get(addr); if (!el) { el = window.createTokenElement(addr); window.tokenElementMap.set(addr, el); }
      window.patchTokenElement(el, addr); const currentChildren = Array.from(container.children).filter(c => c.classList.contains('token-sidebar-item'));
      const expectedIndex = index; if (currentChildren[expectedIndex] !== el) { const offset = subTabs ? 1 : 0; const refNode = container.children[expectedIndex + offset]; if (refNode) container.insertBefore(el, refNode); else container.appendChild(el); }
  });
  let pager = document.getElementById('tokenPager'); const hasMoreLocal = filtered.length > window.displayLimit; const mightHaveMoreAPI = !filter && window.hasMoreTokens;
  if (hasMoreLocal || mightHaveMoreAPI) {
      if (!pager) { pager = document.createElement('div'); pager.id = 'tokenPager'; pager.className = 'p-6 flex justify-center w-full'; container.appendChild(pager); }
      const pagerHtml = `<button id="loadMoreTokensBtn" onclick="window.loadMoreTokens('${filter}')" class="px-6 py-2 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-up transition-all">Load More Tokens</button>`;
      if (pager.innerHTML !== pagerHtml) pager.innerHTML = pagerHtml;
  } else {
      if (pager) pager.remove(); let endMarker = document.getElementById('tokenEndMarker');
      if (filtered.length > 0) { if (!endMarker) { endMarker = document.createElement('div'); endMarker.id = 'tokenEndMarker'; endMarker.className = 'py-4 text-center text-[8px] text-muted-text uppercase font-black tracking-widest'; endMarker.textContent = 'End of Token List'; container.appendChild(endMarker); } }
      else if (endMarker) endMarker.remove();
  }
};

window.createTokenElement = function(addr) {
    const el = document.createElement('div'); el.className = 'token-sidebar-item p-3 flex items-center gap-3 cursor-pointer border-b border-card hover:bg-surface transition-all group'; el.setAttribute('data-token', addr); el.onclick = () => window.selectPRC20(addr);
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
        <button class="info-btn p-1 text-muted-text hover:text-meme-green transition-colors"><i class="fas fa-info-circle text-xs"></i></button>`;
    el.querySelector('.info-btn').onclick = (e) => { e.stopPropagation(); window.showTokenDetail(e, addr); }; return el;
};

window.patchTokenElement = function(el, addr) {
    const detail = window.tokenDetails.get(addr); if (!detail) return;
    const isActive = window.currentPRC20 === addr;
    if (isActive) el.classList.add('active', 'bg-meme-green/10', 'border-l-4', 'border-l-meme-green'); else el.classList.remove('active', 'bg-meme-green/10', 'border-l-4', 'border-l-meme-green');
    const symbolEl = el.querySelector('.token-symbol'); const safeSymbol = window.escapeHtml(detail.symbol || '?'); if (symbolEl.textContent !== safeSymbol) symbolEl.textContent = safeSymbol;
    const nameEl = el.querySelector('.token-name'); const safeName = window.escapeHtml(detail.name || addr.slice(0, 8)); if (nameEl.textContent !== safeName) nameEl.textContent = safeName;
    const changeEl = el.querySelector('.token-change'); const priceChangeRaw = window.numtokenlist(detail.price_change_24h); const priceChangePct = priceChangeRaw * 100; const changeText = `${priceChangePct >= 0 ? '+' : ''}${priceChangePct.toFixed(2)}%`;
    if (changeEl.textContent !== changeText) { changeEl.textContent = changeText; changeEl.classList.remove('text-soft-success', 'text-soft-failed'); changeEl.classList.add(priceChangePct >= 0 ? 'text-soft-success' : 'text-soft-failed'); }
    const mcapEl = el.querySelector('.token-mcap'); const mcapUsd = window.numtokenlist(detail.market_cap_usd); const mcapText = `MCap $${window.formatAmount(mcapUsd)}`; if (mcapEl.textContent !== mcapText) mcapEl.textContent = mcapText;
    const liqEl = el.querySelector('.token-liq'); const liqUsd = window.numtokenlist(detail.liquidity_usd); const liqText = `Liq $${window.formatAmount(liqUsd)}`; if (liqEl.textContent !== liqText) liqEl.textContent = liqText;
    const pumpInd = el.querySelector('.pump-indicator'); if (detail.is_pump) pumpInd.classList.remove('hidden'); else pumpInd.classList.add('hidden');
    const verInd = el.querySelector('.verified-indicator'); if (detail.verified) verInd.classList.remove('hidden'); else verInd.classList.add('hidden');
    const logoContainer = el.querySelector('.token-logo-container'); const logoUrl = window.normalizeLogoUrl(detail.logo);
    if (logoUrl) {
        let img = logoContainer.querySelector('img');
        if (!img) { logoContainer.innerHTML = ''; img = document.createElement('img'); img.className = 'w-10 h-10 border-2 border-card group-hover:rotate-6 transition-transform object-cover'; img.loading = 'lazy'; img.onerror = () => { img.classList.add('hidden'); logoContainer.textContent = safeSymbol.charAt(0); }; logoContainer.appendChild(img); }
        if (img.src !== logoUrl) img.src = logoUrl; img.classList.remove('hidden');
    } else logoContainer.innerHTML = safeSymbol.charAt(0);
};

window.setSubSort = function(subSort) { window.currentSubSort = subSort; window.renderTokenSidebar(); };

window.loadMoreTokens = async function(filter) {
    if (window.isTokenSidebarLoading) return;
    window.isTokenSidebarLoading = true;
    const btn = document.getElementById('loadMoreTokensBtn'); if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Loading...'; }
    try { if (!filter) { await window.fetchNextContractPage(); window.displayLimit = window.tokenAddresses.length; } else window.displayLimit += 20; window.renderTokenSidebar(filter, true); }
    catch (e) { console.error('Load more error:', e); } finally { window.isTokenSidebarLoading = false; }
};

window.filterTokenSidebar = function() {
    const el = document.getElementById('tokenSidebarSearch'); const search = el ? el.value.trim() : ''; window.currentTokenSearch = search;
    if (window.searchTimeout) clearTimeout(window.searchTimeout);
    if (search.startsWith('paxi') && search.length > 40 && !window.tokenDetails.has(search)) { window.loadTokenDetail(search).then(() => { if (window.renderTokenSidebar) window.renderTokenSidebar(search); }); return; }
    window.searchTimeout = setTimeout(async () => { if (search.length >= 2) await window.searchTokensAPI(search); if (window.renderTokenSidebar) window.renderTokenSidebar(search); }, 400);
};

window.updateTokenCard = function(address) { const el = window.tokenElementMap.get(address) || document.querySelector(`[data-token="${address}"]`); if (el) window.patchTokenElement(el, address); };
