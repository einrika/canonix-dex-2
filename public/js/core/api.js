// ============================================
// API.JS - API Calls & Data Fetching
// ============================================

// ===== PAXI PRICE ORACLE =====
window.paxiPriceUSD = 0.00;
window.lastPaxiFetch = 0;

window.fetchPaxiPrice = async function() {
  // Throttle to once per 30 seconds
  if (Date.now() - window.lastPaxiFetch < 30000 && window.paxiPriceUSD > 0) {
    return window.paxiPriceUSD;
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd"
    );
    
    if (!response.ok) throw new Error("Failed to fetch price");
    
    const data = await response.json();
    const price = data["paxi-network"]?.usd;
    
    if (typeof price !== "number") throw new Error("Invalid price data");

    window.paxiPriceUSD = price;
    window.lastPaxiFetch = Date.now();

    // Dispatch event to notify UI of price change
    window.dispatchEvent(new CustomEvent('paxi_price_updated', { detail: price }));

    return price;
    
  } catch (e) {
    console.error("CoinGecko fetch error:", e);
    // If we have a cached price, return it even if old
    return window.paxiPriceUSD || 0.00;
  }
};

// ===== GET PRC20 BALANCE =====
window.getPRC20Balance = async function(address, contract) {
  try {
    const query = { balance: { address } };
    const queryB64 = btoa(JSON.stringify(query));
    
    const data = await window.smartFetch(
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
    const data = await window.smartFetch(`${window.APP_CONFIG.LCD}/paxi/swap/pool/${window.currentPRC20}`);
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
    // Network requires min 40,000 upaxi fee
    const gasLimit = 500000 + (300000 * (msgCount - 1));
    const est = Math.max(Math.ceil(gasLimit * 0.025), 40000);
    return {
      gasPrice: "0.025",
      gasLimit: gasLimit.toString(),
      estimatedFee: est.toString(),
      usdValue: (est / 1e6 * (window.paxiPriceUSD || 0.05)).toFixed(4)
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
// ===== FETCH USER LP POSITIONS DIRECT =====
window.fetchUserLPPositions = async function(userAddress) {
  if (!userAddress) return [];

  try {
    // 1. Fetch all pools from LCD
    const data = await window.smartFetch(`${window.APP_CONFIG.LCD}/paxi/swap/pools`);
    const pools = data.pools || [];

    // 2. Fetch user's token list to narrow down potential positions
    const accountsData = await window.smartFetch(
      `${window.APP_CONFIG.EXPLORER_API}/prc20/my_contract_accounts?address=${userAddress}&page=0`
    );
    const userTokens = (accountsData.accounts || []).map(a => a.contract.contract_address);

    // 3. Filter pools where user might have assets
    const relevantPools = pools.filter(p => userTokens.includes(p.prc20));

    // 4. Batch fetch positions from LCD
    const positions = [];
    const batchSize = 5;
    for (let i = 0; i < relevantPools.length; i += batchSize) {
      const batch = relevantPools.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async pool => {
        try {
          const pos = await window.smartFetch(
            `${window.APP_CONFIG.LCD}/paxi/swap/position/${userAddress}/${pool.prc20}`
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

      const paxiPriceUSD = window.paxiPriceUSD || 0.05;
      const prc20PriceUSD = (tokenDetail && tokenDetail.priceUSD) ? tokenDetail.priceUSD : (paxiPriceUSD * (paxiReserve / prc20Reserve));
      const totalUSD = (myPaxi * paxiPriceUSD) + (myPrc20 * (prc20PriceUSD || 0));

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
