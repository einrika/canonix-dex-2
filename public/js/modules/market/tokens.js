// ============================================
// TOKENS.JS - Data Management Only (NO RENDERING)
// ============================================
// NOTE: All rendering functions are in rendering.js

// ===== GLOBAL TOKEN STATE =====
window.currentPRC20 = '';
window.tokenAddresses = [];
window.tokenDetails = new Map();
window.currentTokenInfo = null;
window.currentSort = 'hot';
window.displayLimit = 20; // Default limit
window.currentContractPage = 0;
window.isFetchingMore = false;
window.myTokenBalances = new Map();
window.tokenBlockHeights = new Map();
window.hasMoreTokens = true;
window.totalTokensAvailable = 0;

// ===== PROCESS TOKEN DETAIL =====
window.processTokenDetail = function(contractAddress, data) {
    const c = data.contract || data;
    const decimals = c.decimals || 6;
    const totalSupplyNum = parseFloat(c.total_supply || 0);
    const totalSupply = totalSupplyNum / Math.pow(10, decimals);

    let pricePaxi = 0;
    if (c.reserve_prc20 > 0) {
        pricePaxi = (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6);
    }

    const marketCapPaxi = totalSupply * pricePaxi;
    const marketCapUsd = marketCapPaxi * (window.paxiPriceUSD || 0.05);
    const logo = window.normalizeLogoUrl(c.logo);
    
    return {
        id: c.id,
        address: contractAddress,
        name: c.name || 'Unknown',
        symbol: c.symbol || 'N/A',
        decimals: decimals,
        total_supply: c.total_supply,
        total_supply_num: totalSupply,
        logo: logo,
        description: c.desc || '',
        project: c.project || '',
        marketing: c.marketing || '',
        holders: parseInt(c.holders || 0, 10),
        liquidity: (parseFloat(c.reserve_paxi || 0) * 2) / 1000000,
        liquidity_usd: (parseFloat(c.reserve_paxi || 0) * 2 * (window.paxiPriceUSD || 0.05)) / 1000000,
        verified: c.official_verified === true,
        price_change_24h: parseFloat(c.price_change || 0),
        reserve_paxi: parseFloat(c.reserve_paxi || 0),
        reserve_prc20: parseFloat(c.reserve_prc20 || 0),
        price_paxi: pricePaxi,
        price_usd: pricePaxi * (window.paxiPriceUSD || 0.05),
        volume_24h: parseFloat(c.volume || 0),
        market_cap: marketCapPaxi,
        market_cap_usd: marketCapUsd,
        buys: parseInt(c.buys || 0),
        sells: parseInt(c.sells || 0),
        is_pump: c.is_pump === true,
        txs_count: parseInt(c.txs_count || 0),
        created_at: c.created_at,
        website: c.project || '',
        minting_disabled: c.minting_disabled === true,
        official_verified: c.official_verified === true,
        marketing_wallet: c.marketing || '',
        high_24h: parseFloat(c.high_24h || 0),
        low_24h: parseFloat(c.low_24h || 0)
    };
};

// ===== LOAD TOKENS OPTIMIZED =====
window.isTokensLoaded = false;
window.loadTokensOptimized = async function() {
    const sidebar = document.getElementById('tokenSidebar');
    if (window.innerWidth >= 1024 || (sidebar && !sidebar.classList.contains('-translate-x-full'))) {
        if (!window.isTokensLoaded) {
            window.isTokensLoaded = true;
            await window.loadAllTokenAddresses();
            window.startTokenListPolling();
        }
    }
};

// ===== LOAD ALL TOKEN ADDRESSES =====
window.loadAllTokenAddresses = async function() {
    try {
        const url0 = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
        const data0 = await window.fetchDirect(url0);
        
        if (!data0 || !data0.contracts) {
            throw new Error('Invalid response from Explorer API');
        }

        window.totalTokensAvailable = data0.total || data0.totals || 0;

        // Collect new data
        const newAddresses = [];
        data0.contracts.forEach(c => {
            const detail = window.processTokenDetail(c.contract_address, c);
            window.tokenDetails.set(c.contract_address, detail);
            newAddresses.push(c.contract_address);
        });

        // Update list
        window.tokenAddresses = newAddresses;
        window.currentContractPage = 0;
        window.hasMoreTokens = window.totalTokensAvailable > window.tokenAddresses.length;

        // Trigger dynamic render if element exists
        if (window.renderTokenSidebar && document.getElementById('tokenSidebarList')) {
            window.renderTokenSidebar();
        }
        
        if (document.getElementById('totalstoken')) {
            window.updateTokenCounter();
        }
        
    } catch (e) {
        console.error('Token load error:', e);
        if (window.renderTokenSidebar) window.renderTokenSidebar();
    }
};

// ===== START TOKEN LIST POLLING =====
window.tokenPollingInterval = null;
window.startTokenListPolling = function() {
    if (window.tokenPollingInterval) clearInterval(window.tokenPollingInterval);

    window.tokenPollingInterval = setInterval(async () => {
        // Only poll if sidebar is visible or on trade page
        const sidebar = document.getElementById('tokenSidebar');
        if (!sidebar) return; // Exit if not on trade page

        const isVisible = window.innerWidth >= 1024 || (!sidebar.classList.contains('-translate-x-full'));
        if (!isVisible) return;

        try {
            // We only refresh page 0 for price updates
                const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
            const data = await window.fetchDirect(url);

            if (data && data.contracts) {
                data.contracts.forEach(c => {
                    const detail = window.processTokenDetail(c.contract_address, c);
                    window.tokenDetails.set(c.contract_address, detail);
                });

                // Trigger dynamic patch (renderTokenSidebar handles diff/patch)
                if (window.renderTokenSidebar) {
                    window.renderTokenSidebar(window.currentTokenSearch || '');
                }

                if (window.updateTicker) window.updateTicker();
            }
        } catch (e) {
            console.warn('Token polling failed:', e);
        }
    }, 30000); // 30 seconds
};

// ===== UPDATE TOKEN COUNTER =====
window.updateTokenCounter = function() {
    const counterEl = document.getElementById('totalstoken');
    if (counterEl) {
        const loaded = window.tokenAddresses.length;
        const total = window.totalTokensAvailable || '?';
        counterEl.textContent = `${loaded} of ${total}`;
    }
};

// ===== FETCH NEXT CONTRACT PAGE =====
window.fetchNextContractPage = async function() {
    if (window.isFetchingMore || !window.hasMoreTokens) return false;
    
    window.isFetchingMore = true;

    try {
        const targetPage = window.currentContractPage + 1;
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=${targetPage}`;
        const data = await window.fetchDirect(url);

        if (!data || !data.contracts || data.contracts.length === 0) {
            window.hasMoreTokens = false;
            return false;
        }

        if (data.total || data.totals) window.totalTokensAvailable = data.total || data.totals;
        window.currentContractPage = targetPage;

        data.contracts.forEach(c => {
            const detail = window.processTokenDetail(c.contract_address, c);
            window.tokenDetails.set(c.contract_address, detail);
            if (!window.tokenAddresses.includes(c.contract_address)) {
                window.tokenAddresses.push(c.contract_address);
            }
        });

        window.hasMoreTokens = window.totalTokensAvailable > window.tokenAddresses.length;
        window.updateTokenCounter();

        return window.hasMoreTokens;

    } catch (e) {
        console.error('Failed to fetch more tokens:', e);
        return false;
    } finally {
        window.isFetchingMore = false;
    }
};

// ===== LOAD TOKEN DETAIL =====
window.loadTokenDetail = async function(contractAddress) {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-detail?address=${contractAddress}`;
        const data = await window.fetchDirect(url);
        
        if (data && data.contract) {
            const detail = window.processTokenDetail(contractAddress, data);
            window.tokenDetails.set(contractAddress, detail);
            return detail;
        }
    } catch (e) {
        console.error('Error loading token detail:', e);
    }
    return null;
};

// ===== LOAD TOKEN DETAILS IN BATCHES =====
window.loadTokenDetailsInBatches = async function(addresses) {
    const needed = addresses.filter(addr => !window.tokenDetails.has(addr));
    if (needed.length === 0) return;
    
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < needed.length; i += BATCH_SIZE) {
        const batch = needed.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(addr =>
            window.loadTokenDetail(addr).then(() => {
                if (window.updateTokenCard) window.updateTokenCard(addr);
            })
        ));
        await new Promise(resolve => setTimeout(resolve, 50));
    }
};

// ===== UPDATE MY TOKENS =====
window.updateMyTokens = async function() {
    if (!window.wallet) return;
    try {
        const tokens = await window.loadWalletTokens(window.wallet.address);
        window.myTokenBalances.clear();
        tokens.forEach(t => {
            const decimals = t.detail?.decimals || 6;
            window.myTokenBalances.set(t.address, parseFloat(t.balance) / Math.pow(10, decimals));
        });
    } catch (e) {
        console.error('Failed to update my tokens:', e);
    }
};

// ===== SET SORT =====
window.setSort = async function(sortType, event) {
    window.currentSort = sortType;
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.remove('bg-meme-green', 'text-black');
        btn.classList.add('bg-black', 'text-white');
    });

    if (event && event.currentTarget) {
        event.currentTarget.classList.add('bg-meme-green', 'text-black');
        event.currentTarget.classList.remove('bg-black', 'text-white');
    } else {
        // Fallback search by sortType if event is missing (e.g. initial load)
        const allBtns = document.querySelectorAll('.sort-btn');
        allBtns.forEach(btn => {
            if (btn.getAttribute('onclick')?.includes(`'${sortType}'`)) {
                btn.classList.add('bg-meme-green', 'text-black');
                btn.classList.remove('bg-black', 'text-white');
            }
        });
    }

    if (sortType === 'nonpump') {
        await window.loadNonPumpTokens();
    }

    if (window.renderTokenSidebar) window.renderTokenSidebar();
};

// ===== LOAD NON-PUMP TOKENS =====
window.loadNonPumpTokens = async function() {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?page=0&type=nonpump`;
        const data = await window.fetchDirect(url);

        if (data && data.contracts) {
            data.contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                window.tokenDetails.set(c.contract_address, detail);
                if (!window.tokenAddresses.includes(c.contract_address)) {
                    window.tokenAddresses.push(c.contract_address);
                }
            });
        }
    } catch (e) {
        console.error('Failed to load non-pump tokens:', e);
    }
};

// ===== FILTER TOKEN SIDEBAR =====
window.searchTimeout = null;
window.currentTokenSearch = '';
window.filterTokenSidebar = function() {
    const el = document.getElementById('tokenSidebarSearch');
    const search = el ? el.value.trim() : '';
    window.currentTokenSearch = search;

    if (window.searchTimeout) clearTimeout(window.searchTimeout);

    if (search.startsWith('paxi') && search.length > 40 && !window.tokenDetails.has(search)) {
        window.loadTokenDetail(search).then(() => {
            if (window.renderTokenSidebar) window.renderTokenSidebar(search);
        });
        return;
    }

    window.searchTimeout = setTimeout(async () => {
        if (search.length >= 2) await window.searchTokensAPI(search);
        if (window.renderTokenSidebar) window.renderTokenSidebar(search);
    }, 400);
};

// ===== SEARCH TOKENS API =====
window.searchTokensAPI = async function(query) {
    try {
        const url = `${window.APP_CONFIG.BACKEND_API}/api/token-list?query=${encodeURIComponent(query)}`;
        const data = await window.fetchDirect(url);
        const contracts = data.contracts || (Array.isArray(data) ? data : []);

        if (contracts && contracts.length > 0) {
            contracts.forEach(c => {
                const detail = window.processTokenDetail(c.contract_address, c);
                window.tokenDetails.set(c.contract_address, detail);
                if (!window.tokenAddresses.includes(c.contract_address)) {
                    window.tokenAddresses.unshift(c.contract_address);
                }
            });
        }
    } catch (e) {
        console.warn('Search API call failed:', e);
    }
};

// ===== REFRESH ALL UI =====
window.refreshAllUI = async function() {
    if (!window.currentPRC20) return;

    try {
        const detail = window.tokenDetails.get(window.currentPRC20);
        if (detail) window.updateDashboard(detail);

        // Start long-running fetches in parallel without awaiting them all if they block UI
        await window.loadPriceHistory(window.currentPRC20, window.currentTimeframe);

        // Background tasks
        if (window.loadTokenHolders) window.loadTokenHolders();

        // Immediate UI updates
        if (window.renderSwapTerminal) window.renderSwapTerminal();

        // Non-blocking data refresh
        (async () => {
            if (window.fetchPoolData) await window.fetchPoolData();
            if (window.updateBalances) await window.updateBalances();
        })();
    } catch (e) {
        console.error('Refresh UI error:', e);
    }
};

// ===== SELECT PRC20 =====
window.selectPRC20 = async function(contractAddress) {
    window.currentPRC20 = contractAddress;
    window.holdersPage = 1;

    localStorage.setItem('canonix_last_token', contractAddress);

    if (window.closeAllSidebars) window.closeAllSidebars();
    window.hideTokenSelector();

    const url = new URL(window.location);
    url.searchParams.set('token', contractAddress);
    window.history.pushState({}, '', url);
    
    try {
        window.currentTokenInfo = await window.loadTokenDetail(contractAddress);
        if (!window.currentTokenInfo) {
                        return;
        }
        
        await window.refreshAllUI();
        
        const shortName = window.currentTokenInfo?.symbol || contractAddress.slice(0, 8);
        window.setText('selectedPair', `${shortName}/PAXI`);
        
        const toSymbol = window.tradeType === 'buy' ? shortName : 'PAXI';
        const fromSymbol = window.tradeType === 'buy' ? 'PAXI' : shortName;
        window.setText('payTokenSymbol', fromSymbol);
        window.setText('recvTokenSymbol', toSymbol);
        
        if (window.currentTokenInfo.volume_24h) {
            window.setText('volVal', window.currentTokenInfo.volume_24h.toFixed(2) + ' PAXI');
        }
        
        if (window.poolData) window.startRealtimeUpdates();
        
        if (window.updateTokenCard) window.updateTokenCard(contractAddress);
        
            } catch (e) {
        console.error('Failed to load token:', e);
            }
};

// ===== DEBUG HELPER =====
window.debugTokenState = function() {
    console.log('=== TOKEN STATE DEBUG ===');
    console.log('Addresses in array:', window.tokenAddresses.length);
    console.log('Details in map:', window.tokenDetails.size);
    console.log('Tokens in DOM:', document.querySelectorAll('[data-token]').length);
    console.log('Has more tokens:', window.hasMoreTokens);
    console.log('Is fetching:', window.isFetchingMore);
    console.log('Current page:', window.currentContractPage);
    
    const unique = new Set(window.tokenAddresses);
    console.log('Duplicates in array:', window.tokenAddresses.length - unique.size);
    
    const domAddresses = [];
    document.querySelectorAll('[data-token]').forEach(el => {
        domAddresses.push(el.getAttribute('data-token'));
    });
    const uniqueDOM = new Set(domAddresses);
    console.log('Duplicates in DOM:', domAddresses.length - uniqueDOM.size);
};
