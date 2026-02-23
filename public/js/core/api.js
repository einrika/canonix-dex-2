// ============================================
// API.JS - API Calls & Data Fetching
// ============================================

import { APP_CONFIG } from './config.js';
import { fetchDirect, log, formatAmount } from './utils.js';

// ===== PAXI PRICE ORACLE =====
export let paxiPriceUSD = 0.00;
export let lastPaxiFetch = 0;

export const fetchPaxiPrice = async function() {
  try {
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/paxi-price`);
    if (typeof data !== "number") throw new Error("Invalid price data");

    paxiPriceUSD = data;
    lastPaxiFetch = Date.now();

    // Dispatch event to notify UI of price change
    window.dispatchEvent(new CustomEvent('paxi_price_updated', { detail: data }));

    return data;
  } catch (e) {
    console.error("Backend price fetch error:", e);
    return paxiPriceUSD || 0.00;
  }
};

// ===== GET PRC20 BALANCE =====
export const getPRC20Balance = async function(address, contract) {
  try {
    const query = { balance: { address } };
    const queryB64 = btoa(JSON.stringify(query));
    
    const data = await fetchDirect(
      `${APP_CONFIG.BACKEND_API}/api/smart-query?contract=${contract}&query=${queryB64}`
    );
    
    return parseInt(data.data.balance || 0);
  } catch (e) {
    return 0;
  }
};

// ===== FETCH POOL DATA =====
export const fetchPoolData = async function() {
  if (!window.currentPRC20) return;
  
  try {
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/pool?address=${window.currentPRC20}`);
    const pool = data.pool || data;

    // Standard Paxi Network Price Calculation
    if (pool && pool.reserve_paxi && pool.reserve_prc20) {
      const reservePaxi = parseFloat(pool.reserve_paxi);
      const reservePrc20 = parseFloat(pool.reserve_prc20);

      // Get decimals from tokenDetails if available, default to 6
      const tokenDetail = window.tokenDetails ? window.tokenDetails.get(window.currentPRC20) : null;
      const decimals = tokenDetail ? tokenDetail.decimals : 6;

      if (reservePrc20 > 0) {
        // formula: (paxi_amount / 10^6) / (prc20_amount / 10^decimals)
        pool.price_paxi_per_prc20 = (reservePaxi / reservePrc20) * Math.pow(10, decimals - 6);
      } else {
        pool.price_paxi_per_prc20 = 0;
      }
    }

    window.poolData = pool;
    log('Pool data fetched successfully', 'success');
    return pool;
  } catch (e) {
    log('Failed to fetch pool: ' + e.message, 'error');
    return null;
  }
};

// ===== LOAD TRANSACTION HISTORY =====
export let historyPage = 1;
export let historyIsEnd = false;

export const loadTransactionHistory = async function(address, page = 1) {
  if (!address) return [];
  
  try {
    const params = new URLSearchParams({
      address: address,
      page: page,
      limit: 10,
      _t: Date.now()
    });
    
    const url = `${APP_CONFIG.BACKEND_API}/api/tx-history?${params.toString()}`;
    
    const data = await fetchDirect(url);
    
    if (data && data.transactions) {
      if (data.transactions.length < 10) historyIsEnd = true;
      return data.transactions;
    }
    
  } catch (e) {
    console.error('Failed to load transaction history:', e);
  }
  
  return [];
};

export const fetchTxDetail = async function(hash) {
  try {
    const url = `${APP_CONFIG.BACKEND_API}/api/tx-detail?hash=${hash}`;
    return await fetchDirect(url);
  } catch (e) {
    console.error('Failed to fetch tx detail:', e);
    return null;
  }
};

// ===== FETCH GAS ESTIMATE =====
export const fetchGasEstimate = async function(msgCount = 1) {
  try {
    const data = await fetchDirect(`/api/gas-estimate?msgs=${msgCount}`);
    return data;
  } catch (e) {
    // Network requires min 40,000 upaxi fee
    const gasLimit = 500000 + (300000 * (msgCount - 1));
    const est = Math.max(Math.ceil(gasLimit * 0.05), 40000);
    return {
      gasPrice: "0.05",
      gasLimit: gasLimit.toString(),
      estimatedFee: est.toString(),
      usdValue: (est / 1e6 * (paxiPriceUSD || 0.05)).toFixed(4)
    };
  }
};

// ===== LOAD WALLET TOKENS =====
export const loadWalletTokens = async function(address) {
  if (!address) return [];
  try {
    const url = `${APP_CONFIG.BACKEND_API}/api/wallet-tokens?address=${address}`;
    const data = await fetchDirect(url);

    if (data && data.accounts) {
      return data.accounts.map(item => {
        // Use global window.processTokenDetail for now, it will be refactored later
        const detail = window.processTokenDetail(item.contract.contract_address, item.contract);
        if (window.tokenDetails) window.tokenDetails.set(item.contract.contract_address, detail);
        return {
          address: item.contract.contract_address,
          balance: item.account.balance,
          detail: detail
        };
      });
    }
  } catch (e) {
    console.error('Failed to load wallet tokens:', e);
  }
  return [];
};

// ===== FETCH USER LP POSITIONS DIRECT =====
export const fetchUserLPPositions = async function(userAddress) {
  if (!userAddress) return [];

  try {
    // 1. Fetch all pools from backend
    const data = await fetchDirect(`${APP_CONFIG.BACKEND_API}/api/all-pools`);
    const pools = data.pools || [];

    // 2. Fetch user's token list to narrow down potential positions via backend
    const accountsData = await fetchDirect(
      `${APP_CONFIG.BACKEND_API}/api/wallet-tokens?address=${userAddress}`
    );
    const userTokens = (accountsData.accounts || []).map(a => a.contract.contract_address);

    // 3. Filter pools where user might have assets
    const relevantPools = pools.filter(p => userTokens.includes(p.prc20));

    // 4. Batch fetch positions from backend
    const positions = [];
    const batchSize = 5;
    for (let i = 0; i < relevantPools.length; i += batchSize) {
      const batch = relevantPools.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async pool => {
        try {
          const pos = await fetchDirect(
            `${APP_CONFIG.BACKEND_API}/api/lp-position?address=${userAddress}&token=${pool.prc20}`
          );
          if (pos.position && parseFloat(pos.position.lp_amount) > 0) {
            return { pool, position: pos.position };
          }
        } catch (e) { }
        return null;
      }));
      positions.push(...results.filter(r => r !== null));
    }

    // 5. Map to UI format
    return positions.map(item => {
      const pool = item.pool;
      const pos = item.position;
      const tokenDetail = window.tokenDetails?.get(pool.prc20);
      const decimals = tokenDetail?.decimals || 6;

      const lpAmount = parseFloat(pos.lp_amount) / 1000000;
      const totalLP = parseFloat(pool.total_lp_amount || pool.total_lp || 1) / 1000000;
      const share = lpAmount / totalLP;

      const paxiReserve = parseFloat(pool.reserve_paxi) / 1000000;
      const prc20Reserve = parseFloat(pool.reserve_prc20) / Math.pow(10, decimals);

      const myPaxi = paxiReserve * share;
      const myPrc20 = prc20Reserve * share;

      const currentPaxiPriceUSD = paxiPriceUSD || 0.05;
      const prc20PriceUSD = (tokenDetail && tokenDetail.priceUSD) ? tokenDetail.priceUSD : (currentPaxiPriceUSD * (paxiReserve / prc20Reserve));
      const totalUSD = (myPaxi * currentPaxiPriceUSD) + (myPrc20 * (prc20PriceUSD || 0));

      return {
        prc20: pool.prc20,
        symbol: tokenDetail?.symbol || 'TOKEN',
        lpBalance: lpAmount.toFixed(6),
        share: (share * 100).toFixed(4),
        paxiReserve: myPaxi.toFixed(2),
        prc20Reserve: myPrc20.toFixed(2),
        totalUSD: totalUSD.toFixed(2)
      };
    });
  } catch (e) {
    console.error('Failed to fetch LP positions:', e);
    return [];
  }
};
