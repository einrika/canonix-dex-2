/**
 * Backend Feature Configuration
 * This file allows enabling/disabling specific backend services and monitors.
 */

module.exports = {
    // Global Data Monitor: Handles token list and global PAXI price updates.
    // Default: enabled
    ENABLE_GLOBAL_MONITOR: process.env.ENABLE_GLOBAL_MONITOR !== 'false',

    // Contract Details Monitor: Handles realtime price, reserves, and holders polling per active token.
    // Default: disabled (as requested)
    ENABLE_CONTRACT_MONITOR: process.env.ENABLE_CONTRACT_MONITOR === 'true',

    // Add other feature toggles here as needed
};
