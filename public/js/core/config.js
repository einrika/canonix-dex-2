// ============================================
// CONFIG.JS - Global Configuration & Constants
// ============================================

window.APP_CONFIG = {
    // Direct API endpoints (no proxy needed)
    RPC: 'https://mainnet-rpc.paxinet.io',
    LCD: 'https://mainnet-lcd.paxinet.io',
    EXPLORER_API: 'https://explorer.paxinet.io/api',
    WINSCAN_API: 'https://winscan.winsnip.xyz/api',

    // Backend API - Pointing to local node server
    BACKEND_API: (window.location.origin.startsWith('http') ? window.location.origin : 'https://stalwart-ganache-32b226.netlify.app'),
    EXPLORER_API: (window.location.origin.startsWith('http') ? window.location.origin : 'https://stalwart-ganache-32b226.netlify.app') + '/api',
    
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
