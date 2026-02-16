// ============================================
// MAIN.JS - Application Initialization & Orchestration
// ============================================

// ===== GLOBAL POOL STATE =====
window.poolData = null;

// ===== INITIALIZE APP =====
window.addEventListener('load', async () => {
    // Fetch PAXI price first as single source of truth
    await window.fetchPaxiPrice();

    // Initialize chart
    window.initChart();
    
    // Setup update interval
    window.updateInterval = setInterval(() => {
        window.updateAppUI();
    }, 30000);

    // Load swap fee setting
    const savedFee = localStorage.getItem('swap_fee_enabled');
    if (savedFee !== null) {
        window.feeEnabled = savedFee === 'true';
        const toggleEl = document.getElementById('swapFeeToggle');
        if (toggleEl) toggleEl.checked = window.feeEnabled;
    }

    // Check URL params for token, then localStorage, then default
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const lastToken = localStorage.getItem('canonix_last_token');

    // Load tokens optimized
    await window.loadTokensOptimized();

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
        }
    }

    // Select token
    const tokenToLoad = tokenParam || lastToken || window.APP_CONFIG.DEFAULT_TOKEN;
    await window.selectPRC20(tokenToLoad);

    // Set initial trade type
    if (window.setSwapMode) window.setSwapMode('buy');
    if (window.setSidebarTab) window.setSidebarTab('wallet');

    // Update ticker periodically
    if (window.updateTicker) {
        window.updateTicker();
        setInterval(() => window.updateTicker(), 30000);
    }

    // Diagnostic check for libraries
    window.waitForLibrary('PaxiCosmJS', 5000)
        .then(() => window.log('PaxiCosmJS components detected', 'success'))
        .catch(err => window.log('Warning: PaxiCosmJS not detected on load. Wallet features may be delayed.', 'warn'));

    window.log('Canonix loaded', 'info');
});

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
//             loadingScreen.style.display = 'none';
//         }
//     }, 3000);
// });