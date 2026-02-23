const fetch = require('node-fetch');
const { sendResponse } = require('../utils/common');

const LCD_URL = 'https://mainnet-lcd.paxinet.io';
const RPC_URL = 'https://mainnet-rpc.paxinet.io';

const smartQueryHandler = async (req, res) => {
    const { contract, query } = req.query;
    if (!contract || !query) return sendResponse(res, false, null, 'Contract and query required', 400);
    try {
        const url = `${LCD_URL}/cosmwasm/wasm/v1/contract/${contract}/smart/${query}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Smart query failed', 500);
    }
};

const poolDataHandler = async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Token address required', 400);
    try {
        const url = `${LCD_URL}/paxi/swap/pool/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Pool fetch failed', 500);
    }
};

const allPoolsHandler = async (req, res) => {
    try {
        const url = `${LCD_URL}/paxi/swap/pools`; // Some versions use /pools, some /all_pools
        const response = await fetch(url, { timeout: 10000 });
        let data = await response.json();

        if (!data.pools) {
            // Try fallback
            const fallbackRes = await fetch(`${LCD_URL}/paxi/swap/all_pools`, { timeout: 10000 });
            data = await fallbackRes.json();
        }

        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Pools fetch failed', 500);
    }
};

const lpPositionHandler = async (req, res) => {
    const { address, token } = req.query;
    if (!address || !token) return sendResponse(res, false, null, 'Address and token required', 400);
    try {
        const url = `${LCD_URL}/paxi/swap/position/${address}/${token}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'LP position fetch failed', 500);
    }
};

const accountHandler = async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `${LCD_URL}/cosmos/auth/v1beta1/accounts/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Account fetch failed', 500);
    }
};

const paxiBalanceHandler = async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `${LCD_URL}/cosmos/bank/v1beta1/balances/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'PAXI balance fetch failed', 500);
    }
};

const rpcStatusHandler = async (req, res) => {
    try {
        const response = await fetch(`${RPC_URL}/status`, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'RPC status failed', 500);
    }
};

const rpcTxHandler = async (req, res) => {
    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);
    try {
        const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
        const response = await fetch(`${RPC_URL}/tx?hash=${cleanHash}`, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'RPC tx failed', 500);
    }
};

const txDetailHandler = async (req, res) => {
    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);
    try {
        const cleanHash = hash.replace('0x', '');
        let txData = null;
        let source = 'lcd';

        // 1. Try LCD first (standard for details)
        try {
            const lcdUrl = `${LCD_URL}/cosmos/tx/v1beta1/txs/${cleanHash}`;
            const response = await fetch(lcdUrl, { timeout: 5000 });
            if (response.ok) {
                txData = await response.json();
            }
        } catch (e) {
            console.warn(`LCD tx detail failed for ${cleanHash}, trying RPC...`);
        }

        // 2. Fallback to RPC if LCD failed
        if (!txData) {
            try {
                const rpcUrl = `${RPC_URL}/tx?hash=0x${cleanHash}`;
                const response = await fetch(rpcUrl, { timeout: 5000 });
                if (response.ok) {
                    const rpcData = await response.json();
                    if (rpcData.result) {
                        txData = rpcData.result;
                        source = 'rpc';
                    }
                }
            } catch (e) {
                console.warn(`RPC tx detail failed for ${cleanHash}`);
            }
        }

        if (!txData) {
            return sendResponse(res, false, null, 'Transaction not found or node error', 404);
        }

        // Normalize the response for the frontend
        const normalized = {
            hash: cleanHash,
            source: source,
            height: txData.height || (txData.tx_response ? txData.tx_response.height : null),
            status: 'unknown',
            timestamp: txData.timestamp || (txData.tx_response ? txData.tx_response.timestamp : null),
            gas_used: txData.gas_used || (txData.tx_response ? txData.tx_response.gas_used : (txData.tx_result ? txData.tx_result.gas_used : null)),
            gas_wanted: txData.gas_wanted || (txData.tx_response ? txData.tx_response.gas_wanted : (txData.tx_result ? txData.tx_result.gas_wanted : null)),
            raw: txData
        };

        const code = txData.code !== undefined ? txData.code : (txData.tx_response ? txData.tx_response.code : (txData.tx_result ? txData.tx_result.code : null));
        normalized.status = (code === 0 || code === '0') ? 'success' : 'failed';

        return sendResponse(res, true, normalized);
    } catch (error) {
        return sendResponse(res, false, null, 'Tx detail failed: ' + error.message, 500);
    }
};

const getWalletDataHandler = async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);

    try {
        // 1. Fetch PAXI Balance
        const paxiRes = await fetch(`${LCD_URL}/cosmos/bank/v1beta1/balances/${address}`, { timeout: 8000 });
        const paxiData = await paxiRes.json();
        const paxiBalance = (paxiData.balances || []).find(b => b.denom === 'upaxi')?.amount || '0';

        // 2. Fetch PRC20 Token Assets (via existing internal controller logic)
        // We simulate the call to our own API to keep it DRY or just call the logic
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`;
        const tokenRes = await fetch(explorerUrl, { timeout: 8000 });
        const tokenData = await tokenRes.json();
        const tokens = (tokenData.accounts || []).map(item => ({
            address: item.contract.contract_address,
            symbol: item.contract.symbol,
            balance: item.account.balance,
            decimals: item.contract.decimals || 6
        }));

        // 3. Fetch LP Positions
        const poolsRes = await fetch(`${LCD_URL}/paxi/swap/pools`, { timeout: 8000 });
        let poolsData = await poolsRes.json();
        if (!poolsData.pools) {
            const fallback = await fetch(`${LCD_URL}/paxi/swap/all_pools`, { timeout: 8000 });
            poolsData = await fallback.json();
        }
        const pools = poolsData.pools || [];

        // Filter relevant pools (where user has tokens) to reduce calls
        const userTokenAddresses = tokens.map(t => t.address);
        const relevantPools = pools.filter(p => userTokenAddresses.includes(p.prc20));

        const lpPositions = [];
        await Promise.all(relevantPools.map(async (pool) => {
            try {
                const posRes = await fetch(`${LCD_URL}/paxi/swap/position/${address}/${pool.prc20}`, { timeout: 5000 });
                const posData = await posRes.json();
                if (posData.position && parseFloat(posData.position.lp_amount) > 0) {
                    lpPositions.push({
                        prc20: pool.prc20,
                        lp_amount: posData.position.lp_amount,
                        pool_info: pool
                    });
                }
            } catch (e) {}
        }));

        return sendResponse(res, true, {
            address,
            paxi_balance: paxiBalance,
            tokens,
            lp_positions: lpPositions
        });

    } catch (error) {
        console.error('Wallet Data Fetch Error:', error);
        return sendResponse(res, false, null, 'Failed to fetch wallet data', 500);
    }
};

const broadcastHandler = async (req, res) => {
    const { tx_bytes } = req.body;
    if (!tx_bytes) return sendResponse(res, false, null, 'tx_bytes required', 400);
    try {
        const url = `${LCD_URL}/cosmos/tx/v1beta1/txs`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_bytes, mode: 'BROADCAST_MODE_SYNC' })
        });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Broadcast failed', 500);
    }
};

module.exports = {
    smartQueryHandler,
    poolDataHandler,
    allPoolsHandler,
    lpPositionHandler,
    accountHandler,
    paxiBalanceHandler,
    rpcStatusHandler,
    rpcTxHandler,
    txDetailHandler,
    getWalletDataHandler,
    broadcastHandler
};
