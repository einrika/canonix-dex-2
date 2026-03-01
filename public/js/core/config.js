// ============================================
// CONFIG.JS - Global Configuration & Constants
// ============================================

window.APP_CONFIG = {
    // Blockchain Endpoints - Populated via /api/config from backend
    RPC: '',
    LCD: '',
    EXPLORER_API: '',
    EXPLORER_URL: '',
    TESTNET_RPC: '',
    TESTNET_LCD: '',
    TESTNET_EXPLORER: '',
    WINSCAN_API: '',

    // Backend API - Pointing to local node server
    BACKEND_API: (window.location.origin.startsWith('http') ? window.location.origin : 'https://stalwart-ganache-32b226.netlify.app'),
    
    // DEPRECATED: Public proxies removed. Use backend proxy.
    PROXIES: [],
    
    // Defaults (populated via /api/config)
    DENOM: 'upaxi',
    SWAP_MODULE: '',
    TARGET_WALLET: '',
    SWAP_FEE_AMOUNT: 0.0,
    
    CACHE_DURATION: 1 * 60 * 60 * 1000, // 1 hour
    BATCH_SIZE: 50,
    
    ITEMS_PER_PAGE: 20,
    UPDATE_INTERVAL: 10000 // 10 seconds
};

// Remote Config Loader
window.loadRemoteConfig = async function() {
    try {
        const res = await window.fetchDirect('/api/config');
        if (res && res.success && res.data) {
            window.SERVER_CONFIG = res.data;

            // Sync Blockchain Config to APP_CONFIG
            if (res.data.blockchain) {
                window.APP_CONFIG = { ...window.APP_CONFIG, ...res.data.blockchain };
            }

            console.log('✅ Remote config synced to APP_CONFIG');
            window.dispatchEvent(new CustomEvent('paxi_config_loaded', { detail: window.APP_CONFIG }));
            return true;
        }
    } catch (e) {
        console.error('⚠️ Failed to load remote config:', e);
    }
    return false;
};

// Notification messages config
window.NOTIF_CONFIG = {
    WALLET_CONNECT_SUCCESS: 'Wallet connected!',
    WALLET_CONNECT_FAILED: 'Failed to connect',
    SELECT_TOKEN_FIRST: 'Select a token first',
    CONNECT_WALLET_FIRST: 'Connect wallet first',
    ADDRESS_COPIED: 'Address copied!',
    SHARE_LINK_COPIED: 'Share link copied!',
    TOKEN_LOADED: 'Token loaded successfully',
    ERROR_LOADING_TOKEN: 'Error loading token data'
};
