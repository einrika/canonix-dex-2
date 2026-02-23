// ============================================
// API.JS - API Calls & Data Fetching (ES Module)
// ============================================

import { APP_CONFIG } from './config.js';
import { fetchDirect, log } from './utils.js';
import { State } from './state.js';

// ===== PAXI PRICE ORACLE =====
export const fetchPaxiPrice = async () => {
  try {
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/paxi-price`);
    if (typeof data !== "number") throw new Error("Invalid price data");
    State.set('paxiPriceUSD', data);
    return data;
  } catch (e) {
    console.error("Backend price fetch error:", e);
    return State.get('paxiPriceUSD') || 0.05;
  }
};

// ===== FETCH WALLET DATA (AGGREGATED) =====
export const loadWalletData = async (address) => {
    if (!address) return null;
    try {
        const url = `${APP_CONFIG.BACKEND_API}/api/wallet-data?address=${address}`;
        const data = await fetchDirect(url);

        // Update state
        if (data) {
            State.set('walletData', data);
        }
        return data;
    } catch (e) {
        log('Failed to load wallet data: ' + e.message, 'error');
        return null;
    }
};

// ===== FETCH POOL DATA =====
export const fetchPoolData = async (tokenAddress) => {
  if (!tokenAddress) return null;
  try {
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/pool?address=${tokenAddress}`);
    const pool = data.pool || data;
    State.set('poolData', pool);
    return pool;
  } catch (e) {
    log('Failed to fetch pool: ' + e.message, 'error');
    return null;
  }
};

// ===== FETCH TRANSACTION HISTORY =====
export const loadTransactionHistory = async (address, page = 1) => {
  if (!address) return [];
  try {
    const params = new URLSearchParams({ address, page, limit: 10, _t: Date.now() });
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/tx-history?${params.toString()}`);
    if (data && data.transactions) {
        State.set('txHistory', data.transactions);
        return data.transactions;
    }
  } catch (e) {
    console.error('Failed to load transaction history:', e);
  }
  return [];
};

export const fetchTxDetail = async (hash) => {
  try {
    return await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/tx-detail?hash=${hash}`);
  } catch (e) {
    console.error('Failed to fetch tx detail:', e);
    return null;
  }
};

// ===== FETCH GAS ESTIMATE =====
export const fetchGasEstimate = async (msgCount = 1) => {
  try {
    return await fetchDirect(`/api/gas-estimate?msgs=${msgCount}`);
  } catch (e) {
    const paxiPrice = State.get('paxiPriceUSD') || 0.05;
    const gasLimit = 500000 + (300000 * (msgCount - 1));
    const est = Math.max(Math.ceil(gasLimit * 0.05), 40000);
    return {
      gasPrice: "0.05",
      gasLimit: gasLimit.toString(),
      estimatedFee: est.toString(),
      usdValue: (est / 1e6 * paxiPrice).toFixed(4)
    };
  }
};
