// ============================================
// WALLET-CORE.JS - Core Business Logic & State
// ============================================

// ===== 1. SECURITY MODULE =====
class WalletSecurity {
    constructor() {
        this.sessionPin = null;
        this.lockTimeout = null;
        this.TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours session

        this.setupListeners();
    }

    setupListeners() {
        // Auto-lock disabled as per user request (PIN only for lifecycle events)
    }

    resetTimeout() {
        // Auto-lock disabled
    }

    lock() {
        this.sessionPin = null;
        // Clear signer from global wallet state to ensure it can't sign anymore
        if (window.wallet && window.wallet.type === 'internal') {
            window.wallet.signer = null;
        }
        window.dispatchEvent(new CustomEvent('paxi_wallet_locked'));
        if (window.log) window.log("Wallet session locked", "info");

        // Block features immediately
        if (window.checkWalletLock) window.checkWalletLock();
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

    getWallet(id) {
        return this.wallets.find(w => w.id === id) || null;
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
        this.paxiBalanceRaw = '0';
    }

    loadSettings() {
        try {
            const data = localStorage.getItem(this.settingsStorageKey);
            return data ? JSON.parse(data) : { hideZeroBalance: false, assetSort: 'most' };
        } catch (e) {
            return { hideZeroBalance: false, assetSort: 'most' };
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

        // ALWAYS INCLUDE PAXI
        tokenMap.set('PAXI', {
            address: 'PAXI',
            symbol: 'PAXI',
            name: 'Paxi Network',
            decimals: 6,
            logo: 'https://raw.githubusercontent.com/paxinetwork/logos/main/paxi.png',
            balance: this.paxiBalanceRaw
        });

        // Add API tokens
        this.apiTokens.forEach(t => tokenMap.set(t.address, t));

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
            // Use smartFetch - will auto-fallback to proxy if CORS error
            const [data, paxiRes] = await Promise.all([
                window.smartFetch(`https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`),
                window.smartFetch(`${window.APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${address}`).catch(() => null)
            ]);
            
            if (paxiRes && paxiRes.balances) {
                const b = paxiRes.balances.find(x => x.denom === 'upaxi');
                this.paxiBalanceRaw = b ? b.amount : '0';
            }

            if (data && data.accounts) {
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
                    const priceInPaxi = parseFloat(c.price_paxi || c.reserve_paxi / c.reserve_prc20 || 0);
                    // Standardized price calculation: PRC20 value follows PAXI
                    const priceUSD = priceInPaxi * (window.paxiPriceUSD || 0.05);

                    this.metadata.set(c.contract_address, {
                        price: priceInPaxi,
                        change24h: parseFloat(c.price_change || 0),
                        priceUSD: priceUSD,
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
            // 1. Fetch all pools from LCD (direct on-chain truth)
            // 2. Fetch user's token accounts from explorer
            const [poolData, userData] = await Promise.all([
                window.smartFetch(`${window.APP_CONFIG.LCD}/paxi/swap/all_pools`).catch(() => null),
                window.smartFetch(`https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${userAddress}`).catch(() => null)
            ]);

            if (!poolData || !poolData.pools || !userData || !userData.accounts) {
                console.warn('⚠️ Could not fetch pools or user accounts');
                if (userData && userData.accounts) {
                    // Fallback to old sequential method if all_pools fails
                    this.lpAssets = []; // Clear for now or keep old
                }
                return;
            }

            // Create a map of pools for quick lookup
            const poolMap = new Map();
            poolData.pools.forEach(p => poolMap.set(p.prc20, p));

            // Filter tokens that have pools
            const tokensWithPools = userData.accounts.filter(item => poolMap.has(item.contract.contract_address));

            const myLPs = [];

            // Process in small batches to avoid hitting rate limits too hard
            const BATCH_SIZE = 5;
            for (let i = 0; i < tokensWithPools.length; i += BATCH_SIZE) {
                const batch = tokensWithPools.slice(i, i + BATCH_SIZE);
                const batchPromises = batch.map(async (item) => {
                    const contract = item.contract;
                    const pool = poolMap.get(contract.contract_address);

                    try {
                        const posRes = await window.smartFetch(`${window.APP_CONFIG.LCD}/paxi/swap/position/${userAddress}/${contract.contract_address}`);
                        
                        // Handle both possible response formats
                        const lpData = posRes?.position || posRes;
                        if (lpData && parseFloat(lpData.lp_amount) > 0) {
                            const tokenDecimals = contract.decimals || 6;

                            // Use pool data from LCD for reserves (more accurate)
                            const reservePaxi = parseFloat(pool.reserve_paxi);
                            const reservePrc20 = parseFloat(pool.reserve_prc20);
                            const totalLp = parseFloat(pool.total_lp);

                            const lpAmount = parseFloat(lpData.lp_amount);
                            const share = totalLp > 0 ? (lpAmount / totalLp) : 0;
                            const paxiVal = share * (reservePaxi / 1e6);
                            const prc20Val = share * (reservePrc20 / Math.pow(10, tokenDecimals));

                            return {
                                prc20: contract.contract_address,
                                symbol: contract.symbol,
                                logo: contract.logo,
                                lpBalance: window.formatAmount(lpAmount / 1e6, 6),
                                share: (share * 100).toFixed(2),
                                paxiReserve: window.formatAmount(paxiVal, 2),
                                prc20Reserve: window.formatAmount(prc20Val, 2),
                                totalUSD: window.formatAmount((paxiVal * 2) * (window.paxiPriceUSD || 0.05), 2),
                                contractData: { ...contract, ...pool },
                                positionData: lpData
                            };
                        }
                    } catch (e) {
                        console.error(`❌ Failed to check LP for ${contract.symbol}:`, e);
                    }
                    return null;
                });

                const results = await Promise.all(batchPromises);
                results.forEach(res => { if (res) myLPs.push(res); });

                // Small delay between batches
                if (i + BATCH_SIZE < tokensWithPools.length) {
                    await new Promise(r => setTimeout(r, 500));
                }
            }
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

// HELPER: GAS SIMULATION (CLEAN VERSION)
window.simulateGas = async function(messages, memo = "", options = {}) {
    try {
        if (!window.wallet || !window.wallet.address) {
            throw new Error("Wallet not connected");
        }
        
        if (!Array.isArray(messages) || !messages.length) {
            throw new Error("Messages required");
        }
        
        const accountRes = await fetch(
            `${window.APP_CONFIG.LCD}/cosmos/auth/v1beta1/accounts/${window.wallet.address}`
        ).then(r => r.json());
        
        const accountData = accountRes?.account?.base_account || accountRes?.account;
        
        if (!accountData) throw new Error("Account not found");
        
        const sequence = accountData.sequence || "0";
        
        let pubkeyBytes;
        
        if (window.walletType === "keplr" || window.walletType === "internal") {
            const accounts = await window.wallet.signer.getAccounts();
            if (!accounts?.length) throw new Error("Signer account not found");
            pubkeyBytes = accounts[0].pubkey;
        } else {
            if (!window.wallet.public_key) throw new Error("Public key missing");
            
            if (typeof window.wallet.public_key === "string") {
                pubkeyBytes = Uint8Array.from(
                    atob(window.wallet.public_key),
                    c => c.charCodeAt(0)
                );
            } else {
                pubkeyBytes = new Uint8Array(window.wallet.public_key);
            }
        }
        
        const pubkeyAny = {
            typeUrl: "/cosmos.crypto.secp256k1.PubKey",
            value: PaxiCosmJS.PubKey.encode({ key: pubkeyBytes }).finish()
        };
        
        const txBody = PaxiCosmJS.TxBody.fromPartial({
            messages,
            memo
        });
        
        const authInfo = PaxiCosmJS.AuthInfo.fromPartial({
            signerInfos: [{
                publicKey: pubkeyAny,
                modeInfo: { single: { mode: 1 } },
                sequence: BigInt(sequence)
            }],
            fee: {
                amount: [],
                gasLimit: BigInt(0)
            }
        });
        
        const txRaw = PaxiCosmJS.TxRaw.fromPartial({
            bodyBytes: PaxiCosmJS.TxBody.encode(txBody).finish(),
            authInfoBytes: PaxiCosmJS.AuthInfo.encode(authInfo).finish(),
            signatures: [new Uint8Array(64)]
        });
        
        const txBytes = PaxiCosmJS.TxRaw.encode(txRaw).finish();
        if (!txBytes || txBytes.length === 0) throw new Error("Failed to encode transaction for simulation");

        // Use a more robust Uint8Array to Base64 conversion
        const txBytesBase64 = btoa(Array.from(txBytes).map(b => String.fromCharCode(b)).join(''));
        
        if (!txBytesBase64) throw new Error("Failed to convert transaction to Base64");
        
        const response = await fetch("/api/gas-simulate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tx_bytes: txBytesBase64
            })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result?.success || !result?.data?.gas_info) {
            throw new Error("Simulation failed");
        }
        
        const gasUsed = parseInt(result.data.gas_info.gas_used || "0");
        const gasAdjustment = 1.4;
        const gasLimit = Math.ceil(gasUsed * gasAdjustment);
        
        const minGasPrice = 0.05;
        const estimatedFee = Math.ceil(gasLimit * minGasPrice);
        
        return {
            gasPrice: minGasPrice.toString(),
            gasLimit: gasLimit.toString(),
            baseFee: estimatedFee.toString(),
            priorityFee: "0",
            estimatedFee: estimatedFee.toString(),
            estimatedFeeUSD: window.formatAmount(
                estimatedFee / 1e6 * (window.paxiPriceUSD || 0.05),
                4
            )
        };
        
    } catch (e) {
        console.error("Simulation failed, using fallback:", e);
        
        const safeLength = Array.isArray(messages) ? messages.length : 1;
        const gasLimit = 500000 + (300000 * (safeLength - 1));
        
        const minGasPrice = 0.05;
        const est = Math.ceil(gasLimit * minGasPrice);
        
        return {
            gasPrice: minGasPrice.toString(),
            gasLimit: gasLimit.toString(),
            baseFee: est.toString(),
            priorityFee: "0",
            estimatedFee: est.toString(),
            estimatedFeeUSD: window.formatAmount(
                est / 1e6 * (window.paxiPriceUSD || 0.05),
                4
            )
        };
    }
};

// HELPER: CUSTOM TX CONFIRMATION
window.confirmTxCustom = function(memo, feeStr) {
    return new Promise((resolve) => {
        const modal = document.getElementById('txConfirmModal');
        const actionEl = document.getElementById('txConfirmAction');
        const networkEl = document.getElementById('txConfirmNetwork');
        const feeEl = document.getElementById('txConfirmFee');
        const confirmBtn = document.getElementById('txConfirmBtn');
        const cancelBtn = document.getElementById('txCancelBtn');

        if (!modal || !actionEl || !feeEl || !confirmBtn || !cancelBtn) {
            // Fallback to window.confirm if UI elements missing
            resolve(window.confirm(`Confirm Tx: ${memo}\nEst Fee: ${feeStr}`));
            return;
        }

        actionEl.textContent = memo || 'Execute Transaction';
        feeEl.textContent = feeStr || 'Calculating...';
        if (networkEl) networkEl.textContent = window.NetworkManager?.getActiveNetwork().name || 'Paxi Mainnet';

        modal.classList.remove('hidden');
        modal.classList.add('flex');

        const cleanup = (result) => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            confirmBtn.onclick = null;
            cancelBtn.onclick = null;
            resolve(result);
        };

        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick = () => cleanup(false);
    });
};

// HELPER: BUILD & SEND TX
window.buildAndSendTx = async function(messages, memo = "", options = {}) {
    if (!window.wallet) throw new Error("Wallet not connected");

    const { silent = false, sequenceOverride = null, type = 'default', metadata = {}, gasEstimate: preSimulatedGas = null } = options;

    // Safety check: Prevent automatic/silent transactions if wallet is locked
    if (window.walletType === 'internal' && !window.WalletSecurity.getSessionPin()) {
        if (silent) {
            // Silently block background transactions when locked to prevent console noise/loop on refresh
            return { success: false, error: "Wallet locked" };
        }
    }

    const endpoints = window.NetworkManager ? window.NetworkManager.getEndpoints() : {
        rpc: window.APP_CONFIG.RPC,
        lcd: window.APP_CONFIG.LCD,
        chainId: 'paxi-mainnet'
    };

    const loader = document.getElementById('txLoader');
    const showLoader = () => { if (!silent && loader) { loader.classList.remove('hidden'); loader.classList.add('flex'); } };
    const hideLoader = () => { if (loader) { loader.classList.add('hidden'); loader.classList.remove('flex'); } };

    let gasEstimate = preSimulatedGas;

    try {
        if (!silent && !gasEstimate) {
            window.showNotif('Loading', 'info');
            // 1. Simulation first to show fee in confirmation
            gasEstimate = await window.simulateGas(messages, memo, { type });
            const feeDisplay = `${window.formatAmount(parseInt(gasEstimate.estimatedFee) / 1e6, 4)} PAXI`;

            const confirmed = await window.confirmTxCustom(memo, feeDisplay);
            if (!confirmed) throw new Error("Transaction cancelled");

            showLoader();
        } else if (!silent && gasEstimate) {
            const feeDisplay = `${window.formatAmount(parseInt(gasEstimate.estimatedFee) / 1e6, 4)} PAXI`;
            const confirmed = await window.confirmTxCustom(memo, feeDisplay);
            if (!confirmed) throw new Error("Transaction cancelled");
            showLoader();
        }
        // For internal wallet, ensure signer exists
        if (window.walletType === 'internal' && !window.wallet.signer) {
            const walletId = window.wallet?.id;
            const targetWallet = walletId ? window.WalletManager.getWallet(walletId) : window.WalletManager.getActiveWallet();

            if (!targetWallet) throw new Error("Wallet not found. Please reconnect.");
            if (targetWallet.isWatchOnly) throw new Error("Watch-Only wallet cannot sign.");
            
            const pin = window.WalletSecurity.getSessionPin();
            if (!pin) {
                // If session expired, we MUST ask for PIN to decrypt keys.
                // However, with 24h timeout, this should be rare.
                if (window.WalletUI && window.WalletUI.unlockActiveWallet) {
                    window.WalletUI.unlockActiveWallet();
                }
                throw new Error("Wallet session expired. Please unlock.");
            }
            
            // Decrypt and create signer
            const decrypted = await window.WalletSecurity.decrypt(targetWallet.encryptedData, pin);
            const paxi = await window.waitForLibrary('PaxiCosmJS');
            
            if (targetWallet.type === 'mnemonic') {
                const HDWallet = paxi.DirectSecp256k1HdWallet;
                window.wallet.signer = await HDWallet.fromMnemonic(decrypted, { prefix: "paxi" });
            } else if (targetWallet.type === 'privatekey') {
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
        }

        // 2. Fetch Chain ID & Account Info & Gas (if not already simulated)
        const [chainRes, accountRes, finalGasEstimate] = await Promise.all([
            window.fetchDirect(`${endpoints.rpc}/status`),
            window.fetchDirect(`${endpoints.lcd}/cosmos/auth/v1beta1/accounts/${window.wallet.address}`),
            gasEstimate ? Promise.resolve(gasEstimate) : window.simulateGas(messages, memo, { type })
        ]);

        gasEstimate = finalGasEstimate;

        const chainId = chainRes.result.node_info.network;
        const account = accountRes.account.base_account || accountRes.account;
        const accountNumber = account.account_number;
        
        // Use overridden sequence if provided, otherwise fetch from chain
        const sequence = sequenceOverride !== null ? sequenceOverride : account.sequence;

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

        if (!broadcastRes.tx_response || broadcastRes.tx_response.code !== 0) {
            hideLoader();
            const errorLog = broadcastRes.tx_response?.raw_log || broadcastRes.tx_response?.message || "Unknown Network Error";
            throw new Error(`Broadcast failed: ${errorLog}`);
        }

        const hash = broadcastRes.tx_response.txhash;
        console.log('TX Broadcasted, Hash:', hash);

        // 7. Verify Result via Backend (Optimization: Offload polling to server)
        if (!silent) window.showNotif('Confirming transaction...', 'info');

        let resultData = null;
        try {
            // New optimized endpoint handles the polling and validation
            resultData = await window.fetchDirect(`/api/tx-status?hash=${hash}`);
        } catch (e) {
            console.warn("Backend status check failed, falling back to basic verification", e);
        }

        hideLoader();

        if (resultData) {
            const isSuccess = resultData.data.code === 0;

            if (!silent) {
                window.showTxResult({
                    status: isSuccess ? 'success' : 'failed',
                    type: metadata.type || 'Transaction',
                    asset: metadata.asset || '--',
                    amount: metadata.amount || '--',
                    address: metadata.address || window.wallet.address,
                    hash: hash,
                    error: isSuccess ? null : (resultData.log || "Execution Failed"),
                    height: resultData.data.height,
                    gasUsed: resultData.data.gas_used,
                    gasWanted: resultData.data.gas_wanted
                });
            }

            if (!isSuccess) {
                throw new Error(`Transaction failed: ${resultData.data.log || 'Unknown Error'}`);
            }

            return { success: true, hash, ...resultData };
        } else {
            // Fallback if backend check failed but broadcast succeeded
            if (!silent) {
                window.showTxResult({
                    status: 'success',
                    type: metadata.type || 'Transaction',
                    asset: metadata.asset || '--',
                    amount: metadata.amount || '--',
                    address: metadata.address || window.wallet.address,
                    hash: hash,
                    note: "Sent successfully. Status verification pending."
                });
            }
            return { success: true, hash };
        }

    } catch (err) {
        hideLoader();
        console.error("Transaction Error:", err);
        if (!silent) {
            if (err.message !== "Transaction cancelled") {
                window.showTxResult({
                    status: 'failed',
                    type: metadata.type || 'Transaction',
                    asset: metadata.asset || '--',
                    amount: metadata.amount || '--',
                    address: metadata.address || (window.wallet ? window.wallet.address : '--'),
                    error: err.message || "Unknown Error"
                });
            }
        }
        throw err;
    }
};

// 1. SWAP FUNCTION (BUNDLED ATOMIC TX)
window.executeSwap = async function(contractAddress, offerDenom, offerAmount, minReceive, memo = "Canonix Swap") {
    if (!window.wallet) return;

    if (offerAmount <= 0) throw new Error("Invalid amount");

    const tokenDetail = window.tokenDetails?.get(contractAddress);
    const decimals = tokenDetail?.decimals || 6;

    const msgs = [];
    const microOffer = offerDenom === window.APP_CONFIG.DENOM ?
        window.toMicroAmount(offerAmount, 6) :
        window.toMicroAmount(offerAmount, decimals);

    const microMinReceive = offerDenom === window.APP_CONFIG.DENOM ?
        window.toMicroAmount(minReceive, decimals) :
        window.toMicroAmount(minReceive, 6);

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

    // 3. Platform Fee Removed (Bundled Support Fee logic deleted)

    // 4. Send Bundled Transaction (Atomic)
    const isBuy = offerDenom === window.APP_CONFIG.DENOM;
    const metadata = {
        type: 'Swap',
        action: isBuy ? 'Buy' : 'Sell',
        from: `${offerAmount} ${isBuy ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        receive: `${minReceive} ${isBuy ? (tokenDetail?.symbol || 'TOKEN') : 'PAXI'}`,
        asset: isBuy ? `PAXI / ${tokenDetail?.symbol || 'TOKEN'}` : `${tokenDetail?.symbol || 'TOKEN'} / PAXI`,
        amount: `${offerAmount} ${isBuy ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        address: window.wallet.address
    };
    const result = await window.buildAndSendTx(msgs, memo, { type: 'swap', metadata });
    
    // Refresh UI after delay
    setTimeout(async () => {
        if(window.updateBalances) await window.updateBalances();
        if(window.updateLPBalances) await window.updateLPBalances();
        if(window.fetchPoolData) await window.fetchPoolData();
        if(window.loadPriceHistory && window.currentPRC20) {
            window.loadPriceHistory(window.currentPRC20, window.currentTimeframe || '24h');
        }
    }, 3000);

    return result;
};

// 2. LIQUIDITY FUNCTIONS
window.executeAddLPTransaction = async function(contractAddress, paxiAmount, tokenAmount) {
    if (!window.wallet) return;

    const tokenDetail = window.tokenDetails?.get(contractAddress);
    const decimals = tokenDetail?.decimals || 6;

    const msgs = [];
    const microPaxiAmount = window.toMicroAmount(paxiAmount, 6);
    const microPaxi = `${microPaxiAmount}${window.APP_CONFIG.DENOM}`;
    const microToken = window.toMicroAmount(tokenAmount, decimals);

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

    const metadata = {
        type: 'Add Liquidity',
        action: 'Add LP',
        from: `${paxiAmount} PAXI + ${tokenAmount} ${tokenDetail?.symbol || 'TOKEN'}`,
        receive: 'LP',
        asset: `PAXI / ${tokenDetail?.symbol || 'TOKEN'}`,
        amount: `${paxiAmount} PAXI + ${tokenAmount} ${tokenDetail?.symbol || 'TOKEN'}`,
        address: window.wallet.address
    };

    return await window.buildAndSendTx(msgs, "Add Liquidity", { type: 'add_lp', metadata });
};

window.executeRemoveLPTransaction = async function(contractAddress, lpAmount) {
    if (!window.wallet) return;

    const microLP = window.toMicroAmount(lpAmount, 6);
    const msg = {
        creator: window.wallet.address,
        prc20: contractAddress,
        lpAmount: microLP
    };

    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/x.swap.types.MsgWithdrawLiquidity",
        value: PaxiCosmJS.MsgWithdrawLiquidity.encode(msg).finish()
    });

    const metadata = {
        type: 'Remove Liquidity',
        action: 'Remove LP',
        from: `${lpAmount} LP`,
        receive: 'PAXI + Token',
        asset: `PAXI / ${window.tokenDetails?.get(contractAddress)?.symbol || 'TOKEN'}`,
        amount: `${lpAmount} LP`,
        address: window.wallet.address
    };

    return await window.buildAndSendTx([anyMsg], "Remove Liquidity", { type: 'remove_lp', metadata });
};

// 3. SEND FUNCTION
window.executeSendTransaction = async function(tokenAddress, recipient, amount, memo = "Send from Canonix") {
    if (!window.wallet) return;
    
    const tokenDetail = window.tokenDetails?.get(tokenAddress);
    const decimals = tokenAddress === 'PAXI' ? 6 : (tokenDetail?.decimals || 6);

    const microAmount = window.toMicroAmount(amount, decimals);
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

    const metadata = {
        type: 'Send',
        action: 'Send',
        from: `${amount} ${tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        receive: `To ${window.shortenAddress(recipient)}`,
        asset: tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN'),
        amount: `${amount} ${tokenAddress === 'PAXI' ? 'PAXI' : (tokenDetail?.symbol || 'TOKEN')}`,
        address: recipient
    };

    return await window.buildAndSendTx(msgs, memo, { type: 'send', metadata });
};

// 5. BURN FUNCTION
window.executeBurnTransaction = async function(contractAddress, amount) {
    if (!window.wallet) return;

    const tokenDetail = window.tokenDetails?.get(contractAddress);
    const decimals = tokenDetail?.decimals || 6;

    const microAmount = window.toMicroAmount(amount, decimals);

    const burnMsg = {
        burn: {
            amount: microAmount
        }
    };

    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: PaxiCosmJS.MsgExecuteContract.encode({
            sender: window.wallet.address,
            contract: contractAddress,
            msg: new TextEncoder().encode(JSON.stringify(burnMsg)),
            funds: []
        }).finish()
    });

    const metadata = {
        type: 'Burn',
        action: 'Burn',
        from: `${amount} ${tokenDetail?.symbol || 'TOKEN'}`,
        receive: 'Supply Reduction',
        asset: tokenDetail?.symbol || 'TOKEN',
        amount: `${amount} ${tokenDetail?.symbol || 'TOKEN'}`,
        address: window.wallet.address
    };

    return await window.buildAndSendTx([anyMsg], "Burn Tokens", { type: 'burn', metadata });
};

// 4. DONATION FUNCTION
window.executeDonationTransaction = async function(amount, silent = false) {
    if (!window.wallet) return;
    const microAmount = window.toMicroAmount(amount, 6);
    
    const msg = PaxiCosmJS.MsgSend.fromPartial({
        fromAddress: window.wallet.address,
        toAddress: window.APP_CONFIG.TARGET_WALLET,
        amount: [{ denom: window.APP_CONFIG.DENOM, amount: microAmount }]
    });
    
    const anyMsg = PaxiCosmJS.Any.fromPartial({
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: PaxiCosmJS.MsgSend.encode(msg).finish()
    });

    return await window.buildAndSendTx([anyMsg], "Support Project", { silent });
};