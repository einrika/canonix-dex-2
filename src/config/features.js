/**
 * Backend Feature Configuration
 * This file allows enabling/disabling specific backend services and monitors.
 */

module.exports = {
    // Global Data Monitor: Handles token list and global PAXI price updates.
    // Default: enabled
    ENABLE_GLOBAL_MONITOR: process.env.ENABLE_GLOBAL_MONITOR !== 'false',

    // Contract Details Monitor: Handles realtime reserves, and holders polling per active token.
    // Default: disabled
    ENABLE_CONTRACT_MONITOR: process.env.ENABLE_CONTRACT_MONITOR === 'true',

    // Price Streaming Monitor: Handles realtime price data for the chart using PRC20 Price API.
    // Default: enabled (Essential for real-time chart)
    ENABLE_PRICE_STREAMING: process.env.ENABLE_PRICE_STREAMING !== 'false',
};
