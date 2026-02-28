// ============================================
// MAIN.JS - Application Initialization & Orchestration
// ============================================

// ===== GLOBAL POOL STATE =====
window.poolData = null;

// ===== INITIALIZE APP =====
window.addEventListener('load', async () => {
    // 1. Fetch Server Config first (Essential for UI behavior)
    window.SERVER_CONFIG = {
        priority_tokens: [],
        default_token: null,
        priority_order: ["verified", "priority", "sort"],
        default_sort: "hot",
        default_sub_sort: "all",
        display_limit: 20,
        filters: { enable_nonpump: true, enable_verified: true }
    };

    try {
        const res = await window.fetchDirect('/api/config');
        if (res && res.success && res.data) {
            window.SERVER_CONFIG = { ...window.SERVER_CONFIG, ...res.data };
            console.log('✅ Server config loaded:', window.SERVER_CONFIG);
        }
    } catch (e) {
        console.error('⚠️ Failed to load server config, using fallbacks:', e);
    }

    // Set initial display limit from config
    window.displayLimit = window.SERVER_CONFIG.display_limit || 20;
    window.currentSort = window.SERVER_CONFIG.default_sort || 'hot';
    window.currentSubSort = window.SERVER_CONFIG.default_sub_sort || 'all';

    // 2. Fetch PAXI price first as single source of truth
    await window.fetchPaxiPrice();

    // Initialize chart
    window.initChart();
    
    // Setup update interval (DEPRECATED: Using WebSocket)
    window.updateInterval = null;

    // Platform fee disabled
    window.feeEnabled = false;

    // Check URL params for token, then localStorage, then default
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const lastToken = localStorage.getItem('canonix_last_token');

    // Load tokens optimized (Handles initial list load)
    await window.loadTokensOptimized();

    // Initialize Global Socket Listeners once
    if (window.setupTokenSocketListeners) {
        window.setupTokenSocketListeners();
    }

    // Initialize Sidebar Monitoring if open (Desktop)
    if (window.innerWidth >= 1024 && window.PaxiSocket && window.PaxiSocket.joinSidebar) {
        window.PaxiSocket.joinSidebar();
    }

    // Upgraded Wallet: Auto-connect if active wallet exists
    if (window.WalletManager) {
        const active = window.WalletManager.getActiveWallet();
        if (active) {
            console.log('🔄 Auto-connecting wallet:', active.name);

            // Set initial state for active wallet (will be fully connected if watch-only or unlocked)
            window.wallet = {
                address: active.address,
                name: active.name,
                type: 'internal',
                id: active.id,
                isWatchOnly: !!active.isWatchOnly,
                signer: null
            };
            window.walletType = 'internal';

            window.dispatchEvent(new CustomEvent('paxi_wallet_connected', { detail: { wallet: active } }));

            // Trigger immediate UI update for connected wallet
            if (window.renderSwapTerminal) window.renderSwapTerminal();

            // Background fetch user assets
            if (window.AssetManager) {
                window.AssetManager.fetchUserAssets(active.address);
            }

            // AUTO-UNLOCK REQUIREMENT (Strict Security)
            window.checkWalletLock();
        }
    }

    // Select token
    const tokenToLoad = tokenParam || lastToken || window.SERVER_CONFIG.default_token;
    if (tokenToLoad) await window.selectPRC20(tokenToLoad);

    // Set initial trade type
    if (window.setSwapMode) window.setSwapMode('buy');
    if (window.setSidebarTab) window.setSidebarTab('wallet');

    // Update ticker periodically (WebSocket handles most updates now)
    if (window.updateTicker) {
        window.updateTicker();
    }

    // Diagnostic check for libraries
    window.waitForLibrary('PaxiCosmJS', 5000)
        .then(() => window.log('PaxiCosmJS components detected', 'success'))
        .catch(err => window.log('Warning: PaxiCosmJS not detected on load. Wallet features may be delayed.', 'warn'));

    window.log('Canonix loaded', 'info');

    // Handle tab visibility changes (WebSocket connection handled in socket.js)
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            window.log('Tab visible: refreshing data state', 'info');
            window.updateAppUI();
            if (window.startRealtimeUpdates) window.startRealtimeUpdates();
        }
    });
});

window.checkWalletLock = function() {
    const overlay = document.getElementById('featureLockOverlay');
    if (!overlay) return;

    const active = window.WalletManager?.getActiveWallet();
    // If wallet exists and is NOT watch-only and is NOT unlocked
    if (active && !active.isWatchOnly && !window.WalletSecurity.getSessionPin()) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');

        // Auto-show PIN sheet if not already shown
        if (document.getElementById('pinSheet')?.classList.contains('hidden')) {
            // Safety check: ensure WalletUI module is ready
            if (window.WalletUI && typeof window.WalletUI.unlockActiveWallet === 'function') {
                window.WalletUI.unlockActiveWallet();
            } else {
                console.warn('⚠️ WalletUI.unlockActiveWallet not ready yet');
            }
        }
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }
};

window.updateAppUI = async function() {
    // Refresh prices
    await window.fetchPaxiPrice();

    // Refresh swap terminal
    if (window.renderSwapTerminal) await window.renderSwapTerminal();

    // Refresh wallet if active
    if (window.WalletUI && window.currentSidebarTab === 'wallet') {
        window.WalletUI.renderDashboard();
    }
};

// ===== CLEANUP ON UNLOAD =====
window.addEventListener('beforeunload', () => {
    if (window.updateInterval) clearInterval(window.updateInterval);
});

// ===== HIDE LOADING SCREEN =====
// document.addEventListener('DOMContentLoaded', function() {
//     setTimeout(function() {
//         const loadingScreen = document.getElementById('loadingScreen');
//         if (loadingScreen) {
//             loadingScreen.classList.add('hidden');
//         }
//     }, 3000);
// });