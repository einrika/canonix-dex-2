// ============================================
// TOKENS.JS - Data Management Only (NO RENDERING)
// ============================================

import { normalizeLogoUrl, fetchDirect } from '../../core/utils.js';
import { APP_CONFIG } from '../../core/config.js';

// ===== GLOBAL TOKEN STATE =====
export let currentPRC20 = '';
export let tokenAddresses = [];
export let tokenDetails = new Map();
export let currentTokenInfo = null;
export let currentSort = 'hot';
export let displayLimit = 20; // Default limit
export let currentContractPage = 0;
export let isFetchingMore = false;
export let myTokenBalances = new Map();
export let tokenBlockHeights = new Map();
export let hasMoreTokens = true;
export let totalTokensAvailable = 0;

// ===== PROCESS TOKEN DETAIL =====
export const processTokenDetail = function(contractAddress, data) {
    const c = data.contract || data;
    const decimals = c.decimals || 6;

    // Use pre-processed backend data if available, otherwise calculate fallback
    const pricePaxi = c.processed ? c.price_paxi : (c.reserve_prc20 > 0 ? (parseFloat(c.reserve_paxi) / parseFloat(c.reserve_prc20)) * Math.pow(10, decimals - 6) : 0);
    const mcapPaxi = c.processed ? c.market_cap : ((parseFloat(c.total_supply || 0) / Math.pow(10, decimals)) * pricePaxi);
    const liqPaxi = c.processed ? c.liquidity : ((parseFloat(c.reserve_paxi || 0) * 2) / 1000000);

    const marketCapUsd = mcapPaxi * (window.paxiPriceUSD || 0.05);
    const logo = normalizeLogoUrl(c.logo);
    
    return {
        id: c.id,
        address: contractAddress,
        name: c.name || 'Unknown',
        symbol: c.symbol || 'N/A',
        decimals: decimals,
        total_supply: c.total_supply,
        total_supply_num: c.total_supply_num || (parseFloat(c.total_supply || 0) / Math.pow(10, decimals)),
        logo: logo,
        description: c.desc || '',
        project: c.project || '',
        marketing: c.marketing || '',
        holders: parseInt(c.holders || 0, 10),
        liquidity: liqPaxi,
        liquidity_usd: liqPaxi * (window.paxiPriceUSD || 0.05),
        verified: c.official_verified === true,
        price_change_24h: parseFloat(c.price_change || 0),
        reserve_paxi: parseFloat(c.reserve_paxi || 0),
        reserve_prc20: parseFloat(c.reserve_prc20 || 0),
        price_paxi: pricePaxi,
        price_usd: pricePaxi * (window.paxiPriceUSD || 0.05),
        volume_24h: parseFloat(c.volume || 0),
        market_cap: mcapPaxi,
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
export let isTokensLoaded = false;
export const loadTokensOptimized = async function() {
    const sidebar = document.getElementById('tokenSidebar');
    if (window.innerWidth >= 1024 || (sidebar && !sidebar.classList.contains('-translate-x-full'))) {
        if (!isTokensLoaded) {
            isTokensLoaded = true;
            await loadAllTokenAddresses();
            // Polling removed: WebSocket now handles updates via paxi_token_list_updated
            setupTokenSocketListeners();
        }
    }
};

// ===== TOKEN SOCKET LISTENERS =====
export const setupTokenSocketListeners = function() {
    window.addEventListener('paxi_token_list_updated', (event) => {
        const data = event.detail;
        if (data && data.contracts) {
            data.contracts.forEach(c => {
                const detail = processTokenDetail(c.contract_address, c);
                tokenDetails.set(c.contract_address, detail);
                if (!tokenAddresses.includes(c.contract_address)) {
                    tokenAddresses.push(c.contract_address);
                }
            });

            if (window.renderTokenSidebar) {
                window.renderTokenSidebar(window.currentTokenSearch || '');
            }
            if (window.updateTicker) window.updateTicker();
            updateTokenCounter();
        }
    });

    window.addEventListener('paxi_price_updated_socket', (event) => {
        const data = event.detail;
        const currentDetail = tokenDetails.get(data.address);
        if (currentDetail) {
            // Update detail with new socket data
            const updated = {
                ...currentDetail,
                price_paxi: data.price_paxi,
                price_change_24h: data.price_change,
                reserve_paxi: data.reserve_paxi,
                reserve_prc20: data.reserve_prc20,
                volume_24h: data.volume_24h
            };

            // Re-process to update MCAP/LIQ based on new price
            const processed = processTokenDetail(data.address, updated);
            tokenDetails.set(data.address, processed);

            // Update UI if this is the selected token
            if (currentPRC20 === data.address) {
                if (window.updateDashboard) window.updateDashboard(processed);
            }

            if (window.updateTokenCard) window.updateTokenCard(data.address);
        }
    });
};

// ===== LOAD ALL TOKEN ADDRESSES =====
export const loadAllTokenAddresses = async function() {
    try {
        const url0 = `${APP_CONFIG.BACKEND_API}/api/token-list?page=0`;
        const data0 = await fetchDirect(url0, { cache: 'no-store' });
        
        if (!data0 || !data0.contracts) {
            throw new Error('Invalid response from Explorer API');
        }

        totalTokensAvailable = data0.total || data0.totals || 0;

        // Collect new data
        const newAddresses = [];
        data0.contracts.forEach(c => {
            const detail = processTokenDetail(c.contract_address, c);
            tokenDetails.set(c.contract_address, detail);
            newAddresses.push(c.contract_address);
        });

        // Update list
        tokenAddresses = newAddresses;
        currentContractPage = 0;
        hasMoreTokens = totalTokensAvailable > tokenAddresses.length;

        // Trigger dynamic render if element exists
        if (window.renderTokenSidebar && document.getElementById('tokenSidebarList')) {
            window.renderTokenSidebar();
        }
        
        if (document.getElementById('totalstoken')) {
            updateTokenCounter();
        }
        
    } catch (e) {
        console.error('Token load error:', e);
        if (window.renderTokenSidebar) window.renderTokenSidebar();
    }
};

// ===== UPDATE TOKEN COUNTER =====
export const updateTokenCounter = function() {
    const counterEl = document.getElementById('totalstoken');
    if (counterEl) {
        const loaded = tokenAddresses.length;
        const total = totalTokensAvailable || '?';
        counterEl.textContent = `${loaded} of ${total}`;
    }
};

// ===== FETCH NEXT CONTRACT PAGE =====
export const fetchNextContractPage = async function() {
    if (isFetchingMore || !hasMoreTokens) return false;
    
    isFetchingMore = true;

    try {
        const targetPage = currentContractPage + 1;
        const url = `${APP_CONFIG.BACKEND_API}/api/token-list?page=${targetPage}`;
        const data = await fetchDirect(url);

        if (!data || !data.contracts || data.contracts.length === 0) {
            hasMoreTokens = false;
            return false;
        }

        if (data.total || data.totals) totalTokensAvailable = data.total || data.totals;
        currentContractPage = targetPage;

        data.contracts.forEach(c => {
            const detail = processTokenDetail(c.contract_address, c);
            tokenDetails.set(c.contract_address, detail);
            if (!tokenAddresses.includes(c.contract_address)) {
                tokenAddresses.push(c.contract_address);
            }
        });

        hasMoreTokens = totalTokensAvailable > tokenAddresses.length;
        updateTokenCounter();

        return hasMoreTokens;

    } catch (e) {
        console.error('Failed to fetch more tokens:', e);
        return false;
    } finally {
        isFetchingMore = false;
    }
};

// ===== LOAD TOKEN DETAIL =====
export const loadTokenDetail = async function(contractAddress) {
    try {
        const url = `${APP_CONFIG.BACKEND_API}/api/token-detail?address=${contractAddress}`;
        const data = await fetchDirect(url, { cache: 'no-store' });
        
        if (data && data.contract) {
            const detail = processTokenDetail(contractAddress, data);
            tokenDetails.set(contractAddress, detail);
            return detail;
        }
    } catch (e) {
        console.error('Error loading token detail:', e);
    }
    return null;
};

// ===== LOAD TOKEN DETAILS IN BATCHES =====
export const loadTokenDetailsInBatches = async function(addresses) {
    const needed = addresses.filter(addr => !tokenDetails.has(addr));
    if (needed.length === 0) return;
    
    const BATCH_SIZE = 10;
    
    for (let i = 0; i < needed.length; i += BATCH_SIZE) {
        const batch = needed.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(addr =>
            loadTokenDetail(addr).then(() => {
                if (window.updateTokenCard) window.updateTokenCard(addr);
            })
        ));
        await new Promise(resolve => setTimeout(resolve, 50));
    }
};

// ===== SELECT PRC20 =====
export const selectPRC20 = async function(contractAddress) {
    // WebSocket: Subscribe to token updates
    if (window.PaxiSocket && window.PaxiSocket.subscribeToken) {
        window.PaxiSocket.subscribeToken(contractAddress);
    }

    currentPRC20 = contractAddress;
    window.holdersPage = 1;

    localStorage.setItem('canonix_last_token', contractAddress);

    if (window.closeAllSidebars) window.closeAllSidebars();
    if (window.hideTokenSelector) window.hideTokenSelector();

    const url = new URL(window.location);
    url.searchParams.set('token', contractAddress);
    window.history.pushState({}, '', url);
    
    try {
        currentTokenInfo = await loadTokenDetail(contractAddress);
        if (!currentTokenInfo) {
            return;
        }
        
        if (window.refreshAllUI) await window.refreshAllUI();
        
        const shortName = currentTokenInfo?.symbol || contractAddress.slice(0, 8);
        if (window.setText) window.setText('selectedPair', `${shortName}/PAXI`);
        
        const toSymbol = window.tradeType === 'buy' ? shortName : 'PAXI';
        const fromSymbol = window.tradeType === 'buy' ? 'PAXI' : shortName;
        if (window.setText) {
            window.setText('payTokenSymbol', fromSymbol);
            window.setText('recvTokenSymbol', toSymbol);
        }
        
        if (currentTokenInfo.volume_24h && window.setText) {
            window.setText('volVal', currentTokenInfo.volume_24h.toFixed(2) + ' PAXI');
        }
        
        if (window.poolData && window.startRealtimeUpdates) window.startRealtimeUpdates();
        
        if (window.updateTokenCard) window.updateTokenCard(contractAddress);
        
    } catch (e) {
        console.error('Failed to load token:', e);
    }
};

// Assign some to window for legacy support if needed during transition
window.processTokenDetail = processTokenDetail;
window.selectPRC20 = selectPRC20;
window.loadTokensOptimized = loadTokensOptimized;
window.tokenDetails = tokenDetails;
window.currentPRC20 = currentPRC20;
window.tokenAddresses = tokenAddresses;
window.currentTokenInfo = currentTokenInfo;
window.hasMoreTokens = hasMoreTokens;
window.isFetchingMore = isFetchingMore;
window.currentContractPage = currentContractPage;
window.fetchNextContractPage = fetchNextContractPage;
window.loadTokenDetail = loadTokenDetail;
window.searchTokensAPI = async function(query) {
    try {
        const url = `${APP_CONFIG.BACKEND_API}/api/token-list?query=${encodeURIComponent(query)}`;
        const data = await fetchDirect(url);
        const contracts = data.contracts || (Array.isArray(data) ? data : []);

        if (contracts && contracts.length > 0) {
            contracts.forEach(c => {
                const detail = processTokenDetail(c.contract_address, c);
                tokenDetails.set(c.contract_address, detail);
                if (!tokenAddresses.includes(c.contract_address)) {
                    tokenAddresses.unshift(c.contract_address);
                }
            });
        }
    } catch (e) {
        console.warn('Search API call failed:', e);
    }
};
