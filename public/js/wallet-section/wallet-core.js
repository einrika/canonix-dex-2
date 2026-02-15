// ============================================
// WALLET-CORE.JS - Core Business Logic & State
// ============================================

// ===== 1. SECURITY MODULE =====
class WalletSecurity {
    constructor() {
        this.sessionPin = null;
        this.lockTimeout = null;
        this.TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes auto-lock

        this.setupListeners();
    }

    setupListeners() {
        // Auto-lock disabled as per user request
        console.log("🛡️ Wallet security initialized (Auto-lock disabled)");
    }

    resetTimeout() {
        // No-op: Auto-lock disabled
    }

    lock() {
        this.sessionPin = null;
        window.dispatchEvent(new CustomEvent('paxi_wallet_locked'));
        if (window.log) window.log("Wallet session locked", "info");
    }

    setSessionPin(pin) {
        this.sessionPin = pin;
        this.resetTimeout();
    }

    getSessionPin() {
        return this.sessionPin;
    }

    async encrypt(text, pin) {
        if (!window.cryptoUtils) throw new Error("cryptoUtils not loaded");
        return await window.cryptoUtils.encrypt(text, pin);
    }

    async decrypt(encryptedData, pin) {
        if (!window.cryptoUtils) throw new Error("cryptoUtils not loaded");
        return await window.cryptoUtils.decrypt(encryptedData, pin);
    }
}

window.WalletSecurity = new WalletSecurity();

// ===== 2. NETWORK MODULE =====
class NetworkManager {
    constructor() {
        this.storageKey = 'paxi_networks_custom';
        this.activeIdKey = 'paxi_active_network_id';

        this.defaultNetworks = [
            {
                id: 'mainnet',
                name: 'Paxi Mainnet',
                rpc: 'https://mainnet-rpc.paxinet.io',
                lcd: 'https://mainnet-lcd.paxinet.io',
                explorer: 'https://explorer.paxinet.io',
                chainId: 'paxi-mainnet'
            },
            {
                id: 'testnet',
                name: 'Paxi Testnet',
                rpc: 'https://testnet-rpc.paxinet.io',
                lcd: 'https://testnet-lcd.paxinet.io',
                explorer: 'https://testnet-explorer.paxinet.io',
                chainId: 'paxi-testnet'
            }
        ];

        this.customNetworks = this.loadCustomNetworks();
        this.activeId = localStorage.getItem(this.activeIdKey) || 'mainnet';
    }

    loadCustomNetworks() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load custom networks", e);
            return [];
        }
    }

    saveCustomNetworks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.customNetworks));
        window.dispatchEvent(new CustomEvent('paxi_networks_updated'));
    }

    getNetworks() {
        return [...this.defaultNetworks, ...this.customNetworks];
    }

    getActiveNetwork() {
        const net = this.getNetworks().find(n => n.id === this.activeId);
        return net || this.defaultNetworks[0];
    }

    setActiveNetwork(id) {
        const networks = this.getNetworks();
        if (networks.some(n => n.id === id)) {
            this.activeId = id;
            localStorage.setItem(this.activeIdKey, id);
            window.dispatchEvent(new CustomEvent('paxi_network_changed', { detail: this.getActiveNetwork() }));
            return true;
        }
        return false;
    }

    addCustomNetwork(name, rpc, lcd, explorer, chainId) {
        const id = 'custom_' + Date.now();
        const newNet = { id, name, rpc, lcd, explorer, chainId };
        this.customNetworks.push(newNet);
        this.saveCustomNetworks();
        return id;
    }

    deleteCustomNetwork(id) {
        const index = this.customNetworks.findIndex(n => n.id === id);
        if (index !== -1) {
            this.customNetworks.splice(index, 1);
            if (this.activeId === id) {
                this.setActiveNetwork('mainnet');
            }
            this.saveCustomNetworks();
            return true;
        }
        return false;
    }

    getEndpoints() {
        const net = this.getActiveNetwork();
        return {
            rpc: net.rpc,
            lcd: net.lcd,
            explorer: net.explorer,
            chainId: net.chainId
        };
    }
}

window.NetworkManager = new NetworkManager();

// ===== 3. WALLET MANAGER MODULE =====
class WalletManager {
    constructor() {
        this.storageKey = 'paxi_wallets_v2';
        this.activeIdKey = 'paxi_active_wallet_id';
        this.wallets = this.loadWallets();
        this.activeId = localStorage.getItem(this.activeIdKey);

        // Ensure an active wallet is selected if wallets exist
        if (!this.activeId && this.wallets.length > 0) {
            this.setActiveWallet(this.wallets[0].id);
        }
    }

    loadWallets() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error("Failed to load wallets", e);
            return [];
        }
    }

    saveWallets() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.wallets));
        // Trigger event for UI updates
        window.dispatchEvent(new CustomEvent('paxi_wallets_updated', { detail: this.wallets }));
    }

    getWallets() {
        return this.wallets;
    }

    getActiveWallet() {
        return this.wallets.find(w => w.id === this.activeId) || null;
    }

    setActiveWallet(id) {
        if (this.wallets.some(w => w.id === id)) {
            this.activeId = id;
            localStorage.setItem(this.activeIdKey, id);
            window.dispatchEvent(new CustomEvent('paxi_active_wallet_changed', { detail: id }));
            return true;
        }
        return false;
    }

    renameWallet(id, newName) {
        const wallet = this.wallets.find(w => w.id === id);
        if (wallet) {
            wallet.name = newName;
            this.saveWallets();
            return true;
        }
        return false;
    }

    deleteWallet(id) {
        const index = this.wallets.findIndex(w => w.id === id);
        if (index !== -1) {
            this.wallets.splice(index, 1);
            if (this.activeId === id) {
                this.activeId = this.wallets.length > 0 ? this.wallets[0].id : null;
                localStorage.setItem(this.activeIdKey, this.activeId || '');
                window.dispatchEvent(new CustomEvent('paxi_active_wallet_changed', { detail: this.activeId }));
            }
            this.saveWallets();
            return true;
        }
        return false;
    }

    reorderWallets(newOrderIds) {
        const reordered = [];
        newOrderIds.forEach(id => {
            const wallet = this.wallets.find(w => w.id === id);
            if (wallet) reordered.push(wallet);
        });
        this.wallets.forEach(w => {
            if (!newOrderIds.includes(w.id)) reordered.push(w);
        });
        this.wallets = reordered;
        this.saveWallets();
    }

    async addWallet(name, type, encryptedData, address, isWatchOnly = false) {
        const id = 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const newWallet = { id, name, type, address, encryptedData, isWatchOnly };
        this.wallets.push(newWallet);
        this.saveWallets();
        if (!this.activeId) this.setActiveWallet(id);
        return id;
    }

    async importMnemonic(name, mnemonic, pin) {
        const paxi = await window.waitForLibrary('PaxiCosmJS');
        const HDWallet = paxi.DirectSecp256k1HdWallet || window.DirectSecp256k1HdWallet;
        const wallet = await HDWallet.fromMnemonic(mnemonic, { prefix: "paxi" });
        const accounts = await wallet.getAccounts();
        const address = accounts[0].address;

        const encryptedData = await window.WalletSecurity.encrypt(mnemonic, pin);
        return await this.addWallet(name, 'mnemonic', encryptedData, address);
    }

    async importPrivateKey(name, privateKeyHex, pin) {
        const paxi = await window.waitForLibrary('PaxiCosmJS');
        const DirectWallet = paxi.DirectSecp256k1Wallet || window.DirectSecp256k1Wallet;

        // Hex to Uint8Array helper
        const hexToBytes = hex => {
            const bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
                bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
            }
            return bytes;
        };

        const pkBytes = hexToBytes(privateKeyHex.replace('0x', ''));
        const wallet = await DirectWallet.fromKey(pkBytes, "paxi");
        const accounts = await wallet.getAccounts();
        const address = accounts[0].address;

        const encryptedData = await window.WalletSecurity.encrypt(privateKeyHex, pin);
        return await this.addWallet(name, 'privatekey', encryptedData, address);
    }

    async addWatchOnly(name, address) {
        return await this.addWallet(name, 'watchonly', null, address, true);
    }
}

window.WalletManager = new WalletManager();

// ===== AUTO-CONNECT FUNCTIONALITY =====
// Automatically set window.wallet if active wallet exists
(function initAutoConnect() {
    const activeWallet = window.WalletManager.getActiveWallet();
    
    if (activeWallet) {
        console.log('🔄 Auto-connecting wallet:', activeWallet.name);
        
        // Set window.wallet for backward compatibility
        window.wallet = {
            address: activeWallet.address,
            name: activeWallet.name,
            type: activeWallet.isWatchOnly ? 'watch-only' : 'internal',
            id: activeWallet.id
        };
        
        // Set walletType for transaction signing
        window.walletType = activeWallet.isWatchOnly ? null : 'internal';
        
        // Signer will be created by WalletSecurity when PIN is entered
        window.wallet.signer = null;
        
        // Dispatch wallet connected event
        window.dispatchEvent(new CustomEvent('paxi_wallet_connected', {
            detail: { wallet: activeWallet }
        }));
        
        console.log('✅ Auto-connected to:', activeWallet.address, '| Type:', window.walletType);
        
        // Fetch user assets (PRC20 tokens) immediately
        if (window.AssetManager) {
            window.AssetManager.fetchUserAssets(activeWallet.address).then(() => {
                console.log('✅ User assets loaded for swap');
            });
        }
        
        // Update balances after short delay to ensure DOM is ready
        setTimeout(() => {
            if (window.updateBalances) {
                window.updateBalances();
            }
        }, 500);
    } else {
        console.log('ℹ️ No active wallet found for auto-connect');
    }
})();

// ===== 4. ASSET MANAGER MODULE =====
class AssetManager {
    constructor() {
        this.customStorageKey = 'paxi_assets_custom';
        this.hiddenStorageKey = 'paxi_assets_hidden';
        this.settingsStorageKey = 'paxi_assets_settings';
        this.customTokens = this.loadCustomTokens();
        this.hiddenTokens = this.loadHiddenTokens();
        this.settings = this.loadSettings();

        this.metadata = new Map(); // address -> { price, change24h, valueUSD }
        this.lpAssets = [];
        this.apiTokens = [];
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsStorageKey);
            return data ? JSON.parse(data) : { hideZeroBalance: false };
        } catch (e) {
            return { hideZeroBalance: false };
        }
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem(this.settingsStorageKey, JSON.stringify(this.settings));
        window.dispatchEvent(new CustomEvent('paxi_assets_updated'));
    }

    loadCustomTokens() {
        try {
            const data = localStorage.getItem(this.customStorageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    loadHiddenTokens() {
        try {
            const data = localStorage.getItem(this.hiddenStorageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    save() {
        localStorage.setItem(this.customStorageKey, JSON.stringify(this.customTokens));
        localStorage.setItem(this.hiddenStorageKey, JSON.stringify(this.hiddenTokens));
        window.dispatchEvent(new CustomEvent('paxi_assets_updated'));
    }

    async addCustomToken(address) {
        if (this.customTokens.some(t => t.address === address)) return;

        try {
            // Fetch token details from API
            const detail = await window.fetchDirect(`/api/token-detail?address=${address}`);
            const token = detail.contract || detail;

            this.customTokens.push({
                address: token.contract_address || address,
                symbol: token.symbol || 'TOKEN',
                name: token.name || 'Unknown Token',
                decimals: token.decimals || 6,
                logo: token.logo || ''
            });
            this.save();
            return true;
        } catch (e) {
            console.error("Failed to add custom token", e);
            throw e;
        }
    }

    removeCustomToken(address) {
        this.customTokens = this.customTokens.filter(t => t.address !== address);
        this.save();
    }

    toggleVisibility(address) {
        if (this.hiddenTokens.includes(address)) {
            this.hiddenTokens = this.hiddenTokens.filter(a => a !== address);
        } else {
            this.hiddenTokens.push(address);
        }
        this.save();
    }

    isTokenVisible(address) {
        return !this.hiddenTokens.includes(address);
    }

    getTokens() {
        // Use a Map to ensure unique tokens by address
        const tokenMap = new Map();

        // Add API tokens FIRST (highest priority - from my_contract_accounts)
        this.apiTokens.forEach(t => tokenMap.set(t.address, t));

        // Add priority tokens from config (only if not already in API tokens)
        const defaults = (window.APP_CONFIG.PRIORITY_TOKENS || []).map(addr => {
            const detail = window.tokenDetails.get(addr);
            return {
                address: addr,
                symbol: detail?.symbol || 'TOKEN',
                name: detail?.name || 'Unknown Token',
                decimals: detail?.decimals || 6,
                logo: detail?.logo || '',
                isDefault: true
            };
        });
        
        defaults.forEach(t => {
            // Don't override API tokens
            if (!tokenMap.has(t.address) && t.address !== 'PAXI') {
                tokenMap.set(t.address, t);
            }
        });

        // Add custom tokens (only if not already present)
        this.customTokens.forEach(t => {
            if (!tokenMap.has(t.address) && t.address !== 'PAXI') {
                tokenMap.set(t.address, t);
            }
        });

        return Array.from(tokenMap.values());
    }

    async fetchUserAssets(address) {
        try {
            console.log('🔍 Fetching user assets for:', address);
            
            // Use smartFetch - will auto-fallback to proxy if CORS error
            const data = await window.smartFetch(`https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`);
            
            if (data && data.accounts) {
                console.log(`✅ Loaded ${data.accounts.length} token accounts`);
                
                this.apiTokens = data.accounts.map(item => ({
                    address: item.contract.contract_address,
                    symbol: item.contract.symbol,
                    name: item.contract.name,
                    decimals: item.contract.decimals,
                    logo: item.contract.logo,
                    balance: item.account.balance,
                    // Store full contract data for detail modal
                    contractData: item.contract,
                    accountData: item.account
                }));

                // Also update metadata if contract info available
                data.accounts.forEach(item => {
                    const c = item.contract;
                    this.metadata.set(c.contract_address, {
                        price: parseFloat(c.price_paxi || c.reserve_paxi / c.reserve_prc20 || 0),
                        change24h: parseFloat(c.price_change || 0),
                        priceUSD: parseFloat(c.price_usd || (c.price_paxi * (window.paxiPrice || 0.05))),
                        holders: c.holders || 0,
                        volume: c.volume || 0,
                        marketCap: c.market_cap || 0,
                        totalSupply: c.total_supply || 0,
                        reservePaxi: c.reserve_paxi || 0,
                        reservePrc20: c.reserve_prc20 || 0
                    });
                });

                window.dispatchEvent(new CustomEvent('paxi_assets_updated'));
            }
        } catch (e) {
            console.error("❌ Failed to fetch user assets:", e);
            // Don't throw, just log - allow app to continue
        }
    }

    // updateMetadata() - REMOVED
    // No longer needed, metadata (price, change24h, etc) already included in my_contract_accounts API response
    // Data is stored in metadata Map during fetchUserAssets()

    getAssetMeta(address) {
        return this.metadata.get(address) || { price: 0, change24h: 0, priceUSD: 0 };
    }

    async updateLPAssets(userAddress) {
        try {
            console.log('🔍 Checking LP positions for:', userAddress);
            
            // Fetch user's token accounts first with smartFetch
            const data = await window.smartFetch(`https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${userAddress}`);
            
            if (!data || !data.accounts) {
                this.lpAssets = [];
                return;
            }

            const myLPs = [];
            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

            console.log(`📊 Checking ${data.accounts.length} tokens for LP positions...`);

            // Check each token if they have LP positions
            for (let i = 0; i < data.accounts.length; i++) {
                const item = data.accounts[i];
                const contract = item.contract;
                
                try {
                    // Check if this token has a pool by checking reserves
                    if (contract.reserve_paxi && contract.reserve_prc20 && 
                        parseFloat(contract.reserve_paxi) > 0 && parseFloat(contract.reserve_prc20) > 0) {
                        
                        console.log(`💧 Found pool for ${contract.symbol}, checking position...`);
                        
                        // Fetch LP position from blockchain
                        const posRes = await window.fetchDirect(`${window.APP_CONFIG.LCD}/paxi/swap/position/${userAddress}/${contract.contract_address}`);
                        
                        if (posRes && parseFloat(posRes.lp_amount) > 0) {
                            const totalLp = contract.total_lp || (parseFloat(contract.reserve_paxi) * parseFloat(contract.reserve_prc20)) ** 0.5;
                            const lpAmount = parseFloat(posRes.lp_amount) / 1e6;
                            const share = totalLp > 0 ? (lpAmount / (totalLp / 1e6)) * 100 : 0;
                            const paxiVal = (share / 100) * (parseFloat(contract.reserve_paxi) / 1e6);
                            const prc20Val = (share / 100) * (parseFloat(contract.reserve_prc20) / Math.pow(10, contract.decimals || 6));

                            console.log(`✅ LP Position found: ${contract.symbol} (${share.toFixed(2)}%)`);

                            myLPs.push({
                                prc20: contract.contract_address,
                                symbol: contract.symbol,
                                logo: contract.logo,
                                lpBalance: window.formatAmount(lpAmount, 6),
                                share: share.toFixed(2),
                                paxiReserve: window.formatAmount(paxiVal, 2),
                                prc20Reserve: window.formatAmount(prc20Val, 2),
                                totalUSD: window.formatAmount((paxiVal * 2) * (window.paxiPrice || 0.05), 2),
                                // Store full data for detail modal
                                contractData: contract,
                                positionData: posRes
                            });
                        }
                    }
                    
                    // Rate limiting: wait 2 seconds between requests
                    if (i < data.accounts.length - 1) {
                        console.log(`⏳ Waiting 2s before next check... (${i + 1}/${data.accounts.length})`);
                        await delay(2000);
                    }
                } catch (e) {
                    console.error(`❌ Failed to check LP for ${contract.symbol}:`, e);
                    // Continue to next token
                }
            }
            
            console.log(`✅ Found ${myLPs.length} LP positions`);
            this.lpAssets = myLPs;
            window.dispatchEvent(new CustomEvent('paxi_assets_updated'));
        } catch (e) {
            console.error("❌ Failed to update LP assets:", e);
            this.lpAssets = [];
        }
    }
}

window.AssetManager = new AssetManager();

// ===== 5. TRANSACTION CORE MODULE =====

// Global Wallet State
window.wallet = null;
window.walletType = null; // 'paxihub', 'keplr', 'internal'

// HELPER: GAS SIMULATION
window.simulateGas = async function(messages, memo = "") {
    try {
        if (!window.wallet) throw new Error("Wallet not connected");

        // 1. Prepare dummy signer data for simulation
        const accountRes = await window.fetchDirect(`${window.APP_CONFIG.LCD}/cosmos/auth/v1beta1/accounts/${window.wallet.address}`);
        const account = accountRes.account.base_account || accountRes.account;
        const sequence = account.sequence;

        let pubkeyBytes;
        if (window.walletType === 'keplr' || window.walletType === 'internal') {
            const accounts = await window.wallet.signer.getAccounts();
            pubkeyBytes = accounts[0].pubkey;
        } else {
            if (typeof window.wallet.public_key === 'string') {
                pubkeyBytes = Uint8Array.from(atob(window.wallet.public_key), c => c.charCodeAt(0));
            } else {
                pubkeyBytes = new Uint8Array(window.wallet.public_key);
            }
        }

        const pubkeyAny = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish()
        };

        // 2. Build Dummy TxBody & AuthInfo
        const txBody = PaxiCosmJS.TxBody.fromPartial({ messages, memo });
        const authInfo = PaxiCosmJS.AuthInfo.fromPartial({
            signerInfos: [{
                publicKey: pubkeyAny,
                modeInfo: { single: { mode: 1 } },
                sequence: BigInt(sequence)
            }],
            fee: { amount: [], gasLimit: BigInt(0) }
        });

        // 3. Assemble TxRaw with dummy signature
        const txRaw = PaxiCosmJS.TxRaw.fromPartial({
            bodyBytes: PaxiCosmJS.TxBody.encode(txBody).finish(),
            authInfoBytes: PaxiCosmJS.AuthInfo.encode(authInfo).finish(),
            signatures: [new Uint8Array(64)] // Dummy signature
        });

        const txBytes = PaxiCosmJS.TxRaw.encode(txRaw).finish();
        const txBytesBase64 = btoa(String.fromCharCode(...txBytes));

        // 4. Call Serverless Simulation Proxy
        const result = await window.fetchDirect('/api/gas-simulate', {
            method: 'POST',
            body: JSON.stringify({ tx_bytes: txBytesBase64 })
        });

        if (result && result.gas_info) {
            const gasUsed = parseInt(result.gas_info.gas_used);
            const gasAdjustment = 1.4; // 40% safety buffer
            const gasLimit = Math.ceil(gasUsed * gasAdjustment);
            const minGasPrice = 0.025;
            const estimatedFee = Math.ceil(gasLimit * minGasPrice);

            return {
                gasPrice: minGasPrice.toString(),
                gasLimit: gasLimit.toString(),
                baseFee: estimatedFee.toString(),
                priorityFee: "0",
                estimatedFee: estimatedFee.toString(),
                estimatedFeeUSD: window.formatAmount(estimatedFee / 1e6 * (window.paxiPrice || 0.05), 4)
            };
        }
        throw new Error("Invalid simulation response");

    } catch (e) {
        console.error('Simulation failed, using fallback:', e);
        // Fallback formula
        const gasLimit = 500000 + (300000 * (messages.length - 1));
        const est = Math.ceil(gasLimit * 0.025);
        return {
            gasPrice: "0.025",
            gasLimit: gasLimit.toString(),
            baseFee: est.toString(),
            priorityFee: "0",
            estimatedFee: est.toString(),
            estimatedFeeUSD: "0.00"
        };
    }
};

// HELPER: BUILD & SEND TX
window.buildAndSendTx = async function(messages, memo = "", options = {}) {
    if (!window.wallet) throw new Error("Wallet not connected");

    const { silent = false, sequenceOverride = null } = options;
    const endpoints = window.NetworkManager ? window.NetworkManager.getEndpoints() : {
        rpc: window.APP_CONFIG.RPC,
        lcd: window.APP_CONFIG.LCD,
        chainId: 'paxi-mainnet'
    };

    if (!silent) window.showNotif('Building transaction...', 'info');

    try {
        // For internal wallet, ensure signer exists
        if (window.walletType === 'internal' && !window.wallet.signer) {
            // Create signer from encrypted data
            const activeWallet = window.WalletManager.getActiveWallet();
            if (!activeWallet || !activeWallet.encryptedData) {
                throw new Error("Wallet data not found");
            }
            
            const pin = window.WalletSecurity.getSessionPin();
            if (!pin) {
                throw new Error("Please unlock wallet first");
            }
            
            // Decrypt and create signer
            const decrypted = await window.WalletSecurity.decrypt(activeWallet.encryptedData, pin);
            const paxi = await window.waitForLibrary('PaxiCosmJS');
            
            if (activeWallet.type === 'mnemonic') {
                const HDWallet = paxi.DirectSecp256k1HdWallet;
                window.wallet.signer = await HDWallet.fromMnemonic(decrypted, { prefix: "paxi" });
            } else if (activeWallet.type === 'privatekey') {
                const DirectWallet = paxi.DirectSecp256k1Wallet;
                const hexToBytes = hex => {
                    const bytes = new Uint8Array(hex.length / 2);
                    for (let i = 0; i < hex.length; i += 2) {
                        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
                    }
                    return bytes;
                };
                const pkBytes = hexToBytes(decrypted.replace('0x', ''));
                window.wallet.signer = await DirectWallet.fromKey(pkBytes, "paxi");
            }
            
            console.log('✅ Signer created for transaction');
        }

        // 1. Fetch Chain ID, Account Info & Gas Simulation
        const [chainRes, accountRes, gasEstimate] = await Promise.all([
            window.fetchDirect(`${endpoints.rpc}/status`),
            window.fetchDirect(`${endpoints.lcd}/cosmos/auth/v1beta1/accounts/${window.wallet.address}`),
            window.simulateGas(messages, memo)
        ]);

        const chainId = chainRes.result.node_info.network;
        const account = accountRes.account.base_account || accountRes.account;
        const accountNumber = account.account_number;
        
        // Use overridden sequence if provided, otherwise fetch from chain
        const sequence = sequenceOverride !== null ? sequenceOverride : account.sequence;

        console.log('📋 TX Params:', { chainId, accountNumber, sequence, gasEstimate });

        // 2. Prepare Fee
        const fee = {
            amount: [{ denom: window.APP_CONFIG.DENOM, amount: gasEstimate.estimatedFee }],
            gasLimit: gasEstimate.gasLimit
        };

        // 3. Prepare Signer Data
        let pubkeyBytes;
        if (window.walletType === 'keplr' || window.walletType === 'internal') {
            const accounts = await window.wallet.signer.getAccounts();
            pubkeyBytes = accounts[0].pubkey;
        } else {
            // PaxiHub returns base64 string or Uint8Array
            if (typeof window.wallet.public_key === 'string') {
                pubkeyBytes = Uint8Array.from(atob(window.wallet.public_key), c => c.charCodeAt(0));
            } else {
                pubkeyBytes = new Uint8Array(window.wallet.public_key);
            }
        }

        const pubkeyAny = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish()
        };

        // 4. Construct SignDoc
        const txBody = PaxiCosmJS.TxBody.fromPartial({ messages, memo });
        const authInfo = PaxiCosmJS.AuthInfo.fromPartial({ 
            signerInfos: [{
                publicKey: pubkeyAny,
                modeInfo: { single: { mode: 1 } },
                sequence: BigInt(sequence)
            }],
            fee
        });

        const signDoc = PaxiCosmJS.SignDoc.fromPartial({
            bodyBytes: PaxiCosmJS.TxBody.encode(txBody).finish(),
            authInfoBytes: PaxiCosmJS.AuthInfo.encode(authInfo).finish(),
            chainId,
            accountNumber: BigInt(accountNumber)
        });

        // 5. Sign Transaction
        if (!silent) window.showNotif('Please sign the transaction...', 'info');
        let txRaw;

        if (window.walletType === 'keplr') {
             // Keplr signing
            const signResponse = await window.wallet.signer.signDirect(
                window.wallet.address,
                {
                    bodyBytes: signDoc.bodyBytes,
                    authInfoBytes: signDoc.authInfoBytes,
                    chainId: signDoc.chainId,
                    accountNumber: signDoc.accountNumber
                }
            );
            
            const signature = Uint8Array.from(atob(signResponse.signature.signature), c => c.charCodeAt(0));
            
            txRaw = PaxiCosmJS.TxRaw.fromPartial({
                bodyBytes: signResponse.signed.bodyBytes,
                authInfoBytes: signResponse.signed.authInfoBytes,
                signatures: [signature]
            });

        } else if (window.walletType === 'internal') {
            // Internal wallet signing
            const signResponse = await window.wallet.signer.signDirect(
                window.wallet.address,
                signDoc
            );

            txRaw = PaxiCosmJS.TxRaw.fromPartial({
                bodyBytes: signResponse.signed.bodyBytes,
                authInfoBytes: signResponse.signed.authInfoBytes,
                signatures: [Uint8Array.from(atob(signResponse.signature.signature), c => c.charCodeAt(0))]
            });

        } else {
            // PaxiHub signing
            const txObj = {
                bodyBytes: btoa(String.fromCharCode(...signDoc.bodyBytes)),
                authInfoBytes: btoa(String.fromCharCode(...signDoc.authInfoBytes)),
                chainId: signDoc.chainId,
                accountNumber: signDoc.accountNumber.toString()
            };

            const result = await window.wallet.signer.signAndSendTransaction(txObj);
            
            if (!result || !result.success) throw new Error("Signing rejected or failed");
            
            const signatureBytes = Uint8Array.from(atob(result.success), c => c.charCodeAt(0));
            
            txRaw = PaxiCosmJS.TxRaw.fromPartial({
                bodyBytes: signDoc.bodyBytes,
                authInfoBytes: signDoc.authInfoBytes,
                signatures: [signatureBytes]
            });
        }

        // 6. Broadcast
        if (!silent) window.showNotif('Broadcasting transaction...', 'info');
        const txBytes = PaxiCosmJS.TxRaw.encode(txRaw).finish();
        const txBytesBase64 = btoa(String.fromCharCode(...txBytes));

        const broadcastRes = await window.fetchDirect(`${window.APP_CONFIG.LCD}/cosmos/tx/v1beta1/txs`, {
            method: 'POST',
            body: JSON.stringify({ tx_bytes: txBytesBase64, mode: 'BROADCAST_MODE_SYNC' })
        });

        if (broadcastRes.tx_response && broadcastRes.tx_response.code === 0) {
            const hash = broadcastRes.tx_response.txhash;
            if (!silent) window.showNotif(`Transaction Sent! Hash: ${hash.slice(0,6)}...`, 'success');
            console.log('✅ TX Hash:', hash);
            
            return { success: true, hash, ...broadcastRes.tx_response };
        } else {
            throw new Error(broadcastRes.tx_response?.raw_log || "Broadcast failed");
        }

    } catch (err) {
        console.error("Transaction Error:", err);
        if (!silent) window.showNotif(`Error: ${err.message}`, 'error');
        throw err;
    }
};

// FEE TRANSACTION EXECUTOR
window.executeFeeTx = async function(sequence) {
    const microAmount = String(Math.floor(window.APP_CONFIG.SWAP_FEE_AMOUNT * 1000000));
    
    const msg = PaxiCosmJS.MsgSend.fromPartial({
        fromAddress: window.wallet.address,
        toAddress: window.APP_CONFIG.TARGET_WALLET,
        amount: [{ denom: window.APP_CONFIG.DENOM, amount: microAmount }]
    });
    
    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: PaxiCosmJS.MsgSend.encode(msg).finish()
    });

    return await window.buildAndSendTx([anyMsg], "Dev Fee", { 
        silent: true, 
        sequenceOverride: sequence 
    });
};

// 1. SWAP FUNCTION (BUNDLED ATOMIC TX)
window.executeSwap = async function(contractAddress, offerDenom, offerAmount, minReceive, memo = "Canonix Swap") {
    if (!window.wallet) return;

    if (offerAmount <= 0) throw new Error("Invalid amount");

    const msgs = [];
    const microOffer = String(Math.floor(offerAmount * 1000000));
    const microMinReceive = String(Math.floor(minReceive * 1000000));

    // 1. Mandatory Allowance if offering PRC20
    if (offerDenom !== window.APP_CONFIG.DENOM) {
        const allowanceMsg = {
            increase_allowance: {
                spender: window.APP_CONFIG.SWAP_MODULE,
                amount: microOffer
            }
        };
        msgs.push(PaxiCosmJS.Any.fromPartial({
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: PaxiCosmJS.MsgExecuteContract.encode({
                sender: window.wallet.address,
                contract: offerDenom,
                msg: new TextEncoder().encode(JSON.stringify(allowanceMsg)),
                funds: []
            }).finish()
        }));
    }

    // 2. Primary Swap Message
    const swapMsg = {
        creator: window.wallet.address,
        prc20: contractAddress,
        offerDenom: offerDenom,
        offerAmount: microOffer,
        minReceive: microMinReceive
    };

    msgs.push(PaxiCosmJS.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgSwap", 
        value: PaxiCosmJS.MsgSwap.encode(swapMsg).finish()
    }));

    // 3. Optional Bundled Support Fee (Dev Support)
    if (window.feeEnabled) {
        const microFee = String(Math.floor(window.APP_CONFIG.SWAP_FEE_AMOUNT * 1000000));
        const feeMsg = PaxiCosmJS.MsgSend.fromPartial({
            fromAddress: window.wallet.address,
            toAddress: window.APP_CONFIG.TARGET_WALLET,
            amount: [{ denom: window.APP_CONFIG.DENOM, amount: microFee }]
        });
        msgs.push(PaxiCosmJS.Any.fromPartial({
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: PaxiCosmJS.MsgSend.encode(feeMsg).finish()
        }));
    }

    // 4. Send Bundled Transaction (Atomic)
    console.log(`🔄 Sending Bundled Swap TX (${msgs.length} messages)...`);
    const result = await window.buildAndSendTx(msgs, memo);
    
    // Refresh UI after delay
    setTimeout(async () => {
        if(window.updateBalances) await window.updateBalances();
        if(window.updateLPBalances) await window.updateLPBalances();
        if(window.fetchPoolData) await window.fetchPoolData();
    }, 3000);

    return result;
};

// 2. LIQUIDITY FUNCTIONS
window.executeAddLPTransaction = async function(contractAddress, paxiAmount, tokenAmount) {
    if (!window.wallet) return;

    const msgs = [];
    const microPaxiAmount = Math.floor(paxiAmount * 1000000);
    const microPaxi = `${microPaxiAmount}${window.APP_CONFIG.DENOM}`;
    const microToken = String(Math.floor(tokenAmount * 1000000));

    // 1. Increase Allowance for Token
    const allowanceMsg = {
        increase_allowance: {
            spender: window.APP_CONFIG.SWAP_MODULE,
            amount: microToken
        }
    };
    msgs.push(PaxiCosmJS.Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: PaxiCosmJS.MsgExecuteContract.encode({
            sender: window.wallet.address,
            contract: contractAddress,
            msg: new TextEncoder().encode(JSON.stringify(allowanceMsg)),
            funds: []
        }).finish()
    }));

    // 2. Provide Liquidity Msg
    const lpMsg = {
        creator: window.wallet.address,
        prc20: contractAddress,
        paxiAmount: microPaxi,
        prc20Amount: microToken
    };
    msgs.push(PaxiCosmJS.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgProvideLiquidity",
        value: PaxiCosmJS.MsgProvideLiquidity.encode(lpMsg).finish()
    }));

    return await window.buildAndSendTx(msgs, "Add Liquidity");
};

window.executeRemoveLPTransaction = async function(contractAddress, lpAmount) {
    if (!window.wallet) return;

    const microLP = String(Math.floor(lpAmount * 1000000));
    const msg = {
        creator: window.wallet.address,
        prc20: contractAddress,
        lpAmount: microLP
    };

    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgWithdrawLiquidity",
        value: PaxiCosmJS.MsgWithdrawLiquidity.encode(msg).finish()
    });

    return await window.buildAndSendTx([anyMsg], "Remove Liquidity");
};

// 3. SEND FUNCTION
window.executeSendTransaction = async function(tokenAddress, recipient, amount) {
    if (!window.wallet) return;
    
    const microAmount = String(Math.floor(amount * 1000000));
    const msgs = [];

    if (tokenAddress === 'PAXI') {
        // Native Send
        const sendMsg = PaxiCosmJS.MsgSend.fromPartial({   
            fromAddress: window.wallet.address,
            toAddress: recipient,
            amount: [{ denom: window.APP_CONFIG.DENOM, amount: microAmount }]
        });
        msgs.push(PaxiCosmJS.Any.fromPartial({
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: PaxiCosmJS.MsgSend.encode(sendMsg).finish()
        }));
    } else {
        // PRC20 Transfer
        const transferMsg = {
            transfer: {
                recipient: recipient,
                amount: microAmount
            }
        };
        msgs.push(PaxiCosmJS.Any.fromPartial({
            typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
            value: PaxiCosmJS.MsgExecuteContract.encode({
                sender: window.wallet.address,
                contract: tokenAddress,
                msg: new TextEncoder().encode(JSON.stringify(transferMsg)),
                funds: []
            }).finish()
        }));
    }

    return await window.buildAndSendTx(msgs, "Send from Canonix");
};

// 4. DONATION FUNCTION
window.executeDonationTransaction = async function(amount, silent = false) {
    if (!window.wallet) return;
    const microAmount = String(Math.floor(amount * 1000000));
    
    const msg = PaxiCosmJS.MsgSend.fromPartial({
        fromAddress: window.wallet.address,
        toAddress: window.APP_CONFIG.TARGET_WALLET,
        amount: [{ denom: window.APP_CONFIG.DENOM, amount: microAmount }]
    });
    
    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: PaxiCosmJS.MsgSend.encode(msg).finish()
    });

    return await window.buildAndSendTx([anyMsg], "Donation to Dev", { silent });
};