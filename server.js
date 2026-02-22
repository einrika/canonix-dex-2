const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// ============================================
// UTILS (Adapted from netlify/functions/utils/common.js)
// ============================================

const sendResponse = (res, success, data = null, error = null, statusCode = 200) => {
    return res.status(statusCode).json({
        success,
        data,
        error
    });
};

const cache = new Map();
const getCached = (key) => {
    const item = cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
        cache.delete(key);
        return null;
    }
    return item.value;
};

const setCached = (key, value, ttlSeconds = 60) => {
    cache.set(key, {
        value,
        expiry: Date.now() + (ttlSeconds * 1000)
    });
};

const rateLimitMap = new Map();
const checkRateLimit = (ip, limit = 50, windowMs = 60000) => {
    const now = Date.now();
    const userStats = rateLimitMap.get(ip) || { count: 0, startTime: now };

    if (now - userStats.startTime > windowMs) {
        userStats.count = 1;
        userStats.startTime = now;
    } else {
        userStats.count++;
    }

    rateLimitMap.set(ip, userStats);
    return userStats.count <= limit;
};

const isValidPaxiAddress = (address) => {
    return /^paxi1[0-9a-z]{38,85}$/.test(address);
};

let adminState = {
    isFrozen: false,
    blockedAddresses: []
};

// ============================================
// API ROUTES
// ============================================

// Admin Control
app.all('/api/admin-control', (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);

    if (req.method === 'POST') {
        const { action, value } = req.body;
        switch (action) {
            case 'freeze':
                adminState.isFrozen = !!value;
                break;
            case 'block':
                if (value && isValidPaxiAddress(value)) {
                    const blocked = new Set(adminState.blockedAddresses);
                    blocked.add(value);
                    adminState.blockedAddresses = Array.from(blocked);
                } else if (value) {
                    return sendResponse(res, false, null, 'Invalid address to block', 400);
                }
                break;
            case 'unblock':
                if (value && isValidPaxiAddress(value)) {
                    adminState.blockedAddresses = adminState.blockedAddresses.filter(a => a !== value);
                }
                break;
        }
    }
    return sendResponse(res, true, adminState);
});

// AI Analysis
app.post('/api/ai_analysis', async (req, res) => {
    const apiKeys = [];
    if (process.env.GEMINI_API_KEY) apiKeys.push(process.env.GEMINI_API_KEY);
    let keyIndex = 1;
    while (process.env[`GEMINI_API_KEY_${keyIndex}`]) {
        apiKeys.push(process.env[`GEMINI_API_KEY_${keyIndex}`]);
        keyIndex++;
    }

    if (apiKeys.length === 0) {
        return res.status(500).json({ error: 'Server configuration error: No Gemini API keys found' });
    }

    try {
        const { symbol, price, change24h, liquidity, volume, onChainActivity } = req.body;
        const safeSymbol = String(symbol || 'Unknown').replace(/[^a-zA-Z0-9]/g, '');
        const safePrice = String(price || '0').replace(/[^0-9.]/g, '');
        const safeChange = String(change24h || '0').replace(/[^0-9.\-]/g, '');
        const safeLiquidity = String(liquidity || '0').replace(/[^0-9.]/g, '');
        const safeVolume = String(volume || '0').replace(/[^0-9.]/g, '');
        const safeActivity = String(onChainActivity || 'N/A').substring(0, 100);

        const prompt = `You are a professional MEME coin analyst. Analyze this token strictly using real-time data:
Token: ${safeSymbol}
Price: ${safePrice} PAXI
24h Change: ${safeChange}%
Liquidity: ${safeLiquidity} PAXI
Volume 24h: ${safeVolume} PAXI
On-chain Activity: ${safeActivity}

Prioritize current price, volume, market trend, and liquidity in your analysis.
Provide a structured output with:
- Market Sentiment (BULLISH / BEARISH / NEUTRAL)
- Short Summary (Max 60 words)
- Risk Level (LOW / MEDIUM / HIGH / EXTREME)
- Key Indicators (Top 2 signals)

Format with <b> for emphasis. Use a punchy, trader-like tone. Return ONLY inner HTML content.`;

        let lastError = null;
        for (let i = 0; i < apiKeys.length; i++) {
            const apiKey = apiKeys[i];
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                const data = await response.json();
                if (response.status === 429) continue;
                if (!response.ok) throw new Error(data.error?.message || `Gemini API error: ${response.status}`);
                const textResult = data.candidates[0].content.parts[0].text;
                return res.json({ analysis: textResult, keyUsed: i + 1 });
            } catch (error) {
                lastError = error;
            }
        }
        throw new Error(`All available Gemini API keys failed. Last error: ${lastError?.message}`);
    } catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to generate analysis' });
    }
});

// Gas Estimate
app.get('/api/gas-estimate', (req, res) => {
    const { msgs = 1 } = req.query;
    const msgCount = parseInt(msgs);
    const cacheKey = `gas_estimate_${msgCount}`;
    const cached = getCached(cacheKey);
    if (cached) return sendResponse(res, true, cached);

    const GAS_PRICE = 0.025;
    const BASE_GAS = 500000;
    const ADDITIONAL_MSG_GAS = 300000;
    const baseGasLimit = BASE_GAS + (ADDITIONAL_MSG_GAS * (msgCount - 1));
    const gasLimit = Math.ceil(baseGasLimit * 1.4);
    const estimatedFee = Math.ceil(gasLimit * GAS_PRICE);
    const data = {
        gasPrice: GAS_PRICE.toString(),
        gasLimit: gasLimit.toString(),
        estimatedFee: estimatedFee.toString(),
        usdValue: "0.00"
    };
    setCached(cacheKey, data, 300);
    return sendResponse(res, true, data);
});

// Gas Simulate
app.post('/api/gas-simulate', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    try {
        const { tx_bytes } = req.body;
        if (!tx_bytes) return sendResponse(res, false, null, 'tx_bytes required', 400);
        const lcdUrl = 'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/simulate';
        const response = await fetch(lcdUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tx_bytes })
        });
        const data = await response.json();
        if (!response.ok) return sendResponse(res, false, data, 'Simulation failed', response.status);
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Internal server error during simulation', 500);
    }
});

// Proxy
const WHITELISTED_DOMAINS = [
    'paxinet.io',
    'winsnip.xyz',
    'ipfs.io',
    'mypinata.cloud',
    'paxi.mypinata.cloud',
    'paxi-pumpfun.winsnip.xyz'
];

app.all('/api/proxy', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { url } = req.query;
    if (!url) return sendResponse(res, false, null, 'URL required', 400);
    try {
        const parsedUrl = new URL(url);
        const isAllowed = WHITELISTED_DOMAINS.some(domain =>
            parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
        );
        if (!isAllowed) return sendResponse(res, false, null, 'Domain not whitelisted', 403);
        const fetchOptions = {
            method: req.method,
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        };
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            fetchOptions.body = JSON.stringify(req.body);
        }
        const response = await fetch(url, fetchOptions);
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Proxy request failed', 500);
    }
});

// All Pools Data
app.get('/api/all-pools', async (req, res) => {
    try {
        const url = `https://mainnet-lcd.paxinet.io/paxi/swap/all_pools`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'All pools fetch failed', 500);
    }
});

// Pools Data
app.get('/api/pools', async (req, res) => {
    try {
        const url = `https://mainnet-lcd.paxinet.io/paxi/swap/pools`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Pools fetch failed', 500);
    }
});

// LP Position
app.get('/api/lp-position', async (req, res) => {
    const { address, token } = req.query;
    if (!address || !token) return sendResponse(res, false, null, 'Address and token required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/paxi/swap/position/${address}/${token}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'LP position fetch failed', 500);
    }
});

// Pool Data
app.get('/api/pool', async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/paxi/swap/pool/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Pool fetch failed', 500);
    }
});

// Token Detail
app.get('/api/token-detail', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { address } = req.query;
    if (!address || !isValidPaxiAddress(address)) return sendResponse(res, false, null, 'Invalid address', 400);
    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });
        if (!response.ok) return sendResponse(res, false, null, 'Contract not found');
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Failed to fetch contract details', 500);
    }
});

// Token List
app.get('/api/token-list', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { query, page = 0, name, type = 'all' } = req.query;
    const searchQuery = query || name;
    let apiUrl;
    let cacheKey;
    if (searchQuery) {
        apiUrl = `https://explorer.paxinet.io/api/prc20/search?name=${encodeURIComponent(searchQuery)}`;
        cacheKey = `search_${searchQuery}`;
    } else if (type === 'nonpump') {
        apiUrl = `https://paxi-pumpfun.winsnip.xyz/api/prc20-tokens?chain=paxi-mainnet`;
        cacheKey = `nonpump_tokens`;
    } else {
        apiUrl = `https://explorer.paxinet.io/api/prc20/contracts?page=${page}`;
        cacheKey = `list_page_${page}`;
    }
    const cachedData = getCached(cacheKey);
    if (cachedData) return sendResponse(res, true, cachedData);
    try {
        const response = await fetch(apiUrl, { timeout: 10000 });
        if (!response.ok) throw new Error(`API returned ${response.status}`);
        let data = await response.json();
        if (type === 'nonpump' && data.tokens) {
            data.contracts = data.tokens.map(t => ({
                contract_address: t.contract_address,
                name: t.token_info.name,
                symbol: t.token_info.symbol,
                decimals: t.token_info.decimals,
                total_supply: t.token_info.total_supply,
                logo: t.marketing_info.logo?.url,
                desc: t.marketing_info.description,
                project: t.marketing_info.project,
                marketing: t.marketing_info.marketing,
                holders: t.num_holders,
                official_verified: t.verified,
                price_change: t.price_change_24h,
                reserve_paxi: t.reserve_paxi,
                reserve_prc20: t.reserve_prc20,
                volume: t.volume_24h,
                buys: t.buys,
                sells: t.sells,
                is_pump: t.is_pump,
                txs_count: t.txs_count,
                created_at: t.timestamp
            }));
        }
        setCached(cacheKey, data, 120);
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Failed to fetch token list', 500);
    }
});

// PAXI Price
app.get('/api/paxi-price', async (req, res) => {
    const cacheKey = 'paxi_price';
    const cached = getCached(cacheKey);
    if (cached) return sendResponse(res, true, cached);

    try {
        const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=paxi-network&vs_currencies=usd");
        if (!response.ok) throw new Error("Failed to fetch PAXI price");
        const data = await response.json();
        const price = data["paxi-network"]?.usd;
        if (typeof price !== "number") throw new Error("Invalid price data");

        setCached(cacheKey, price, 30); // Cache for 30 seconds
        return sendResponse(res, true, price);
    } catch (e) {
        return sendResponse(res, false, null, e.message, 500);
    }
});

// Token Price
app.get('/api/token-price', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { address, timeframe = '24h' } = req.query;
    if (!address || !isValidPaxiAddress(address)) return sendResponse(res, false, null, 'Invalid address parameter', 400);
    const allowedTFs = ['realtime', '1h', '24h', '7d', '30d'];
    const tf = allowedTFs.includes(timeframe) ? timeframe : '24h';
    const cacheKey = `price_${address}_${tf}`;
    if (tf !== 'realtime') {
        const cachedData = getCached(cacheKey);
        if (cachedData) return sendResponse(res, true, cachedData);
    }
    try {
        let apiUrl = tf === 'realtime' ?
            `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}` :
            `https://paxi-pumpfun.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
        const response = await fetch(apiUrl, { timeout: 10000 });
        if (!response.ok) {
            const winscanUrl = `https://winscan.winsnip.xyz/api/prc20-price-history/${address}?timeframe=${tf}`;
            const fallbackRes = await fetch(winscanUrl, { timeout: 5000 });
            if (!fallbackRes.ok) throw new Error(`Upstream returned ${response.status}`);
            const fallbackData = await fallbackRes.json();
            const normalized = { history: fallbackData.price_history || fallbackData.history || [] };
            if (tf !== 'realtime') setCached(cacheKey, normalized, 60);
            return sendResponse(res, true, normalized);
        }
        const data = await response.json();
        let normalized;
        if (tf === 'realtime') {
            const prices = data.prices || [];
            const now = Date.now();
            normalized = {
                price_change: data.price_change || 0,
                history: prices.map((p, i) => ({
                    timestamp: now - (prices.length - 1 - i) * 10000,
                    price_paxi: p
                }))
            };
        } else {
            normalized = { ...data, history: data.price_history || data.history || [] };
        }
        if (tf !== 'realtime') setCached(cacheKey, normalized, 60);
        return sendResponse(res, true, normalized);
    } catch (error) {
        return sendResponse(res, false, null, 'Failed to fetch price history', 500);
    }
});

// Smart Query (Wasm)
app.get('/api/smart-query', async (req, res) => {
    const { contract, query } = req.query;
    if (!contract || !query) return sendResponse(res, false, null, 'Contract and query required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/cosmwasm/wasm/v1/contract/${contract}/smart/${query}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Smart query failed', 500);
    }
});

// Token Validate
app.get('/api/token-validate', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { address } = req.query;
    if (!address || !isValidPaxiAddress(address)) return sendResponse(res, false, null, 'Invalid address', 400);
    try {
        const explorerUrl = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const response = await fetch(explorerUrl, { timeout: 10000 });
        if (!response.ok) return sendResponse(res, false, { valid: false }, 'Contract not found');
        const data = await response.json();
        const contract = data.contract;
        if (!contract) return sendResponse(res, false, { valid: false }, 'Invalid contract data');
        const hasDecimals = contract.decimals !== undefined;
        const hasSupply = contract.total_supply && parseFloat(contract.total_supply) > 0;
        const hasLiquidity = contract.reserve_paxi && parseFloat(contract.reserve_paxi) > 0;
        const priceUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${address}`;
        const priceRes = await fetch(priceUrl, { timeout: 5000 });
        const hasPriceApi = priceRes.ok;
        const isValid = hasDecimals && hasSupply && hasLiquidity && hasPriceApi;
        return sendResponse(res, isValid, {
            valid: isValid,
            details: { decimals: hasDecimals, supply: hasSupply, liquidity: hasLiquidity, priceApi: hasPriceApi },
            contract: { name: contract.name, symbol: contract.symbol, decimals: contract.decimals }
        }, isValid ? null : 'Token failed validation requirements');
    } catch (error) {
        return sendResponse(res, false, null, 'Validation process failed', 500);
    }
});

// RPC Status
app.get('/api/rpc-status', async (req, res) => {
    try {
        const url = `https://mainnet-rpc.paxinet.io/status`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'RPC status fetch failed', 500);
    }
});

// RPC Tx
app.get('/api/rpc-tx', async (req, res) => {
    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);
    try {
        const url = `https://mainnet-rpc.paxinet.io/tx?hash=${hash}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'RPC tx fetch failed', 500);
    }
});

// Tx Detail
app.get('/api/tx-detail', async (req, res) => {
    const { hash } = req.query;
    if (!hash) return sendResponse(res, false, null, 'Hash required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/txs/${hash}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Tx detail fetch failed', 500);
    }
});

// Account Info
app.get('/api/account', async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/cosmos/auth/v1beta1/accounts/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Account fetch failed', 500);
    }
});

// PAXI Balance
app.get('/api/paxi-balance', async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `https://mainnet-lcd.paxinet.io/cosmos/bank/v1beta1/balances/${address}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'PAXI balance fetch failed', 500);
    }
});

// Token Holders
app.get('/api/holders', async (req, res) => {
    const { address, page = 0 } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `https://explorer.paxinet.io/api/prc20/holders?contract_address=${address}&page=${page}`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Holders fetch failed', 500);
    }
});

// Wallet Tokens
app.get('/api/wallet-tokens', async (req, res) => {
    const { address } = req.query;
    if (!address) return sendResponse(res, false, null, 'Address required', 400);
    try {
        const url = `https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}&page=0`;
        const response = await fetch(url, { timeout: 10000 });
        const data = await response.json();
        return sendResponse(res, true, data);
    } catch (error) {
        return sendResponse(res, false, null, 'Wallet tokens fetch failed', 500);
    }
});

// Broadcast Tx
app.post('/api/broadcast', async (req, res) => {
    try {
        const { tx_bytes } = req.body;
        if (!tx_bytes) return sendResponse(res, false, null, 'tx_bytes required', 400);
        const url = 'https://mainnet-lcd.paxinet.io/cosmos/tx/v1beta1/txs';
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
});

// Tx History
const decodeB64 = (str) => {
    if (!str) return '';
    try { return Buffer.from(str, 'base64').toString(); } catch (e) { return str; }
};

app.get('/api/tx-history', async (req, res) => {
    const ip = req.ip;
    if (!checkRateLimit(ip)) return sendResponse(res, false, null, 'Too many requests', 429);
    const { address, page = 1, limit = 20 } = req.query;
    if (!address || !isValidPaxiAddress(address)) return sendResponse(res, false, null, 'Invalid address', 400);
    try {
        const queries = [`message.sender='${address}'`, `transfer.sender='${address}'`, `transfer.recipient='${address}'` ];
        const allTxs = [];
        const seenHashes = new Set();
        await Promise.all(queries.map(async (q) => {
            try {
                const url = `https://mainnet-rpc.paxinet.io/tx_search?query="${encodeURIComponent(q)}"&page=1&per_page=100&order_by="desc"`;
                const r = await fetch(url, { timeout: 8000 });
                if (!r.ok) return;
                const data = await r.json();
                if (data.result && data.result.txs) {
                    data.result.txs.forEach(tx => {
                        if (!seenHashes.has(tx.hash)) { seenHashes.add(tx.hash); allTxs.push(tx); }
                    });
                }
            } catch (e) {}
        }));
        allTxs.sort((a, b) => parseInt(b.height) - parseInt(a.height));
        const normalized = allTxs.map(t => {
            const events = t.tx_result.events || [];
            const result = {
                hash: t.hash, type: 'send', status: t.tx_result.code === 0 ? 'success' : 'failed',
                timestamp: t.timestamp || null, block: t.height, gasUsed: t.tx_result.gas_used,
                from: null, to: null, contractAddress: null, amounts: []
            };
            events.forEach(ev => {
                const attrs = {};
                ev.attributes.forEach(attr => { attrs[decodeB64(attr.key)] = decodeB64(attr.value); });
                if (ev.type === 'transfer') {
                    if (attrs.sender) result.from = attrs.sender;
                    if (attrs.recipient) result.to = attrs.recipient;
                    if (attrs.amount) {
                        const match = attrs.amount.match(/^(\d+)([a-zA-Z0-9]+)/);
                        if (match) {
                            const raw = parseInt(match[1]); const denom = match[2];
                            const symbol = denom === 'upaxi' ? 'PAXI' : denom.replace(/^u/, '').toUpperCase();
                            const value = raw / 1e6;
                            const sign = attrs.sender === address ? -1 : 1;
                            result.amounts.push({ token: symbol, amount: sign * value });
                        }
                    }
                }
                if (ev.type === 'wasm') {
                    if (attrs._contract_address) result.contractAddress = attrs._contract_address;
                    if (attrs.action) {
                        if (attrs.action.includes('swap')) {
                            result.type = 'swap';
                            const offer = parseInt(attrs.offer_amount || attrs.offerAmount || 0);
                            const ask = parseInt(attrs.return_amount || attrs.askAmount || 0);
                            if (offer) result.amounts.push({ token: (attrs.offer_asset || 'TOKEN').toUpperCase(), amount: -offer / 1e6 });
                            if (ask) result.amounts.push({ token: (attrs.ask_asset || 'PAXI').toUpperCase(), amount: ask / 1e6 });
                        }
                        if (attrs.action.includes('provide_liquidity')) {
                            result.type = 'provide_liquidity';
                            if (attrs.paxiAmount) result.amounts.push({ token: 'PAXI', amount: -(parseInt(attrs.paxiAmount) / 1e6) });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: -(parseInt(attrs.tokenAmount) / 1e6) });
                        }
                        if (attrs.action.includes('withdraw_liquidity')) {
                            result.type = 'withdraw_liquidity';
                            if (attrs.paxiAmount) result.amounts.push({ token: 'PAXI', amount: parseInt(attrs.paxiAmount) / 1e6 });
                            if (attrs.tokenAmount) result.amounts.push({ token: 'TOKEN', amount: parseInt(attrs.tokenAmount) / 1e6 });
                        }
                        if (attrs.action === 'transfer') {
                            result.type = attrs.recipient === address ? 'receive' : 'send';
                            if (attrs.amount) result.amounts.push({ token: 'TOKEN', amount: (attrs.recipient === address ? 1 : -1) * (parseInt(attrs.amount) / 1e6) });
                        }
                    }
                }
            });
            return result;
        });
        const p = parseInt(page); const l = parseInt(limit);
        const startIndex = (p - 1) * l;
        const pagedData = normalized.slice(startIndex, startIndex + l);
        return sendResponse(res, true, { total_count: normalized.length, transactions: pagedData, page: p, limit: l });
    } catch (error) {
        return sendResponse(res, false, null, 'Failed to fetch transaction history', 500);
    }
});

// ============================================
// WEBSOCKET LOGIC
// ============================================

const activeSubscriptions = new Map(); // tokenAddress -> Set of socketIds

io.on('connection', (socket) => {
    socket.on('subscribe', (tokenAddress) => {
        if (!tokenAddress) return;
        socket.join(tokenAddress);
        if (!activeSubscriptions.has(tokenAddress)) {
            activeSubscriptions.set(tokenAddress, new Set());
        }
        activeSubscriptions.get(tokenAddress).add(socket.id);
    });

    socket.on('unsubscribe', (tokenAddress) => {
        if (!tokenAddress) return;
        socket.leave(tokenAddress);
        if (activeSubscriptions.has(tokenAddress)) {
            activeSubscriptions.get(tokenAddress).delete(socket.id);
            if (activeSubscriptions.get(tokenAddress).size === 0) {
                activeSubscriptions.delete(tokenAddress);
            }
        }
    });

    socket.on('disconnect', () => {
        activeSubscriptions.forEach((subs, tokenAddress) => {
            if (subs.has(socket.id)) {
                subs.delete(socket.id);
                if (subs.size === 0) activeSubscriptions.delete(tokenAddress);
            }
        });
    });
});

// Price Polling Worker
setInterval(async () => {
    for (const [tokenAddress, subs] of activeSubscriptions.entries()) {
        try {
            const apiUrl = `https://mainnet-api.paxinet.io/prc20/get_contract_prices?address=${tokenAddress}`;
            const response = await fetch(apiUrl, { timeout: 5000 });
            if (response.ok) {
                const data = await response.json();
                const prices = data.prices || [];
                const lastPrice = prices[prices.length - 1];
                if (lastPrice !== undefined) {
                    io.to(tokenAddress).emit('price_update', {
                        address: tokenAddress,
                        price: lastPrice,
                        price_change: data.price_change || 0,
                        timestamp: Date.now()
                    });
                }
            }
        } catch (e) {
            console.error(`Error polling price for ${tokenAddress}:`, e.message);
        }
    }
}, 5000); // Poll every 5 seconds

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
