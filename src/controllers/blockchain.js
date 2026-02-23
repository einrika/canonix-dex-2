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
        const url = `${LCD_URL}/cosmos/tx/v1beta1/txs/${hash}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();

        if (!response.ok) {
            return sendResponse(res, false, data, data.message || 'Tx detail fetch failed', response.status);
        }

        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Tx detail failed: ' + error.message, 500);
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
    broadcastHandler
};
