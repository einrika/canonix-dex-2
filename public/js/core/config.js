// ============================================
// CONFIG.JS - Global Configuration & Constants
// ============================================

window.APP_CONFIG = {
    // Direct API endpoints (no proxy needed) - Fallbacks
    RPC: 'https://mainnet-rpc.paxinet.io',
    LCD: 'https://mainnet-lcd.paxinet.io',
    EXPLORER_API: 'https://explorer.paxinet.io/api',
    WINSCAN_API: 'https://winscan.winsnip.xyz/api',

    // Backend API - MUST BE FULL URL (not relative path)
    // Browser will auto-replace relative paths with current domain
    BACKEND_API: window.location.origin,
    
    // Proxy servers for CORS bypass (when needed)
    PROXIES: [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://api.allorigins.win/raw?url=',
        'https://thingproxy.freeboard.io/fetch/',
        'https://corsproxy.io/?'
    ],
    
    DENOM: 'upaxi',
    SWAP_MODULE: 'paxi1mfru9azs5nua2wxcd4sq64g5nt7nn4n80r745t',
    TARGET_WALLET: 'paxi1ktdl4hmruyn9vjpf72fxku0jx4lz4q4xknd6ya',
    SWAP_FEE_AMOUNT: 0.0,
    
    CACHE_DURATION: 1 * 60 * 60 * 1000, // 1 hour
    BATCH_SIZE: 50,
    DEFAULT_TOKEN: 'paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u',
    PRIORITY_TOKENS: ['paxi14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9snvcq0u'],
    
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
