// ============================================
// CONFIG.JS - Global Configuration & Constants
// ============================================

export const APP_CONFIG = {
    // Direct API endpoints (no proxy needed)
    RPC: 'https://mainnet-rpc.paxinet.io',
    LCD: 'https://mainnet-lcd.paxinet.io',
    EXPLORER_API_BASE: 'https://explorer.paxinet.io/api',
    WINSCAN_API: 'https://winscan.winsnip.xyz/api',

    // Backend API - Pointing to local node server
    BACKEND_API: window.location.origin,
    EXPLORER_API: window.location.origin + '/api',
    
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
export const NOTIF_CONFIG = {
    WALLET_CONNECT_SUCCESS: 'Wallet connected!',
    WALLET_CONNECT_FAILED: 'Failed to connect',
    SELECT_TOKEN_FIRST: 'Select a token first',
    CONNECT_WALLET_FIRST: 'Connect wallet first',
    ADDRESS_COPIED: 'Address copied!',
    SHARE_LINK_COPIED: 'Share link copied!',
    TOKEN_LOADED: 'Token loaded successfully',
    ERROR_LOADING_TOKEN: 'Error loading token data'
};
