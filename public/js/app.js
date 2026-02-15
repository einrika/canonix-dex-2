// ============================================
// MAIN.JS - Application Initialization & Orchestration
// ============================================

// ===== GLOBAL POOL STATE =====
window.poolData = null;

// ===== INITIALIZE APP =====
window.addEventListener('load', async () => {
    // Initialize chart
    window.initChart();
    
    // Load auto orders from localStorage
    try {
        const savedOrders = localStorage.getItem('canonix_auto_orders');
        if (savedOrders) {
            window.autoOrders = JSON.parse(savedOrders);
        }
    } catch (e) {
        console.error("Error loading auto orders", e);
        window.autoOrders = [];
    }

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

    // Upgraded Wallet: Auto-connect watch-only if active
    if (window.WalletManager) {
        const active = window.WalletManager.getActiveWallet();
        if (active && active.isWatchOnly) {
            window.connectInternalWallet(active.id);
        }
    }

    // Select token
    const tokenToLoad = tokenParam || lastToken || window.APP_CONFIG.DEFAULT_TOKEN;
    await window.selectPRC20(tokenToLoad);

    // Set initial trade type
    if (window.setSwapMode) window.setSwapMode('buy');
    if (window.setOrderType) window.setOrderType('instant');
    if (window.setSidebarTab) window.setSidebarTab('swap');

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