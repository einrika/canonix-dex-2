// ============================================
// API.JS - API Calls & Data Fetching
// ============================================

// ===== PAXI PRICE ORACLE =====
window.paxiPrice = 0.05;
window.fetchPaxiPrice = async function() {
  try {
    // Note: In production, fetch from a real oracle or DEX pool (e.g. PAXI/USDT)
    // For now we use the benchmark price
    window.paxiPrice = 0.05;
    return window.paxiPrice;
  } catch (e) {
    return 0.05;
  }
};

// ===== GET PRC20 BALANCE =====
window.getPRC20Balance = async function(address, contract) {
  try {
    const query = { balance: { address } };
    const queryB64 = btoa(JSON.stringify(query));
    
    const data = await window.fetchDirect(
      `${window.APP_CONFIG.LCD}/cosmwasm/wasm/v1/contract/${contract}/smart/${queryB64}`
    );
    
    return parseInt(data.data.balance || 0);
  } catch (e) {
    return 0;
  }
};

// ===== FETCH POOL DATA =====
window.fetchPoolData = async function() {
  if (!window.currentPRC20) return;
  
  try {
    const data = await window.fetchDirect(`${window.APP_CONFIG.LCD}/paxi/swap/pool/${window.currentPRC20}`);
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
    window.log('Pool data fetched successfully', 'success');
    return pool;
  } catch (e) {
    window.log('Failed to fetch pool: ' + e.message, 'error');
    return null;
  }
};

// ===== LOAD TRANSACTION HISTORY =====
window.historyPage = 1;
window.historyIsEnd = false;

window.loadTransactionHistory = async function(address, page = 1) {
  if (!address) return [];
  try {
    const url = `/api/tx-history?address=${address}&page=${page}&limit=10&_t=${Date.now()}`;
    const data = await window.fetchDirect(url);

    if (data && data.transactions) {
        if (data.transactions.length < 10) window.historyIsEnd = true;
        return data.transactions;
    }
  } catch (e) {
    console.error('Failed to load transaction history:', e);
  }
  return [];
};

window.fetchTxDetail = async function(hash) {
  try {
    const url = `${window.APP_CONFIG.LCD}/cosmos/tx/v1beta1/txs/${hash}`;
    return await window.fetchDirect(url);
  } catch (e) {
    console.error('Failed to fetch tx detail:', e);
    return null;
  }
};

// ===== FETCH GAS ESTIMATE =====
window.fetchGasEstimate = async function(msgCount = 1) {
  try {
    const data = await window.fetchDirect(`/api/gas-estimate?msgs=${msgCount}`);
    return data;
  } catch (e) {
    return {
      gasPrice: "0.025",
      gasLimit: (250000 * msgCount).toString(),
      estimatedFee: (6250 * msgCount).toString(),
      usdValue: (6250 * msgCount / 1e6 * window.paxiPrice).toFixed(4)
    };
  }
};

// ===== LOAD WALLET TOKENS =====
window.loadWalletTokens = async function(address) {
  if (!address) return [];
  try {
    const url = `${window.APP_CONFIG.EXPLORER_API}/prc20/my_contract_accounts?address=${address}&page=0`;
    const data = await window.fetchDirect(url);

    if (data && data.accounts) {
      return data.accounts.map(item => {
        const detail = window.processTokenDetail(item.contract.contract_address, item.contract);
        window.tokenDetails.set(item.contract.contract_address, detail);
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