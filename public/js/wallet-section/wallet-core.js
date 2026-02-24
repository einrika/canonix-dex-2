// ============================================
// WALLET-CORE.JS - Core Business Logic & State
// ============================================

import { State } from '../core/state.js';
import { APP_CONFIG } from '../core/config.js';
import { fetchDirect, log, waitForLibrary, formatAmount, toMicroAmount, showNotif } from '../core/utils.js';

// ===== 1. SECURITY MODULE =====
class WalletSecurity {
    constructor() {
        this.sessionPin = null;
    }

    lock() {
        this.sessionPin = null;
        const wallet = State.get('wallet');
        if (wallet && wallet.type === 'internal') {
            State.set('wallet', { ...wallet, signer: null });
        }
        window.dispatchEvent(new CustomEvent('paxi_wallet_locked'));
        log("Wallet session locked", "info");
    }

    setSessionPin(pin) {
        this.sessionPin = pin;
    }

    getSessionPin() {
        return this.sessionPin;
    }

    async encrypt(text, pin) {
        const cryptoUtils = await waitForLibrary('cryptoUtils');
        return await cryptoUtils.encrypt(text, pin);
    }

    async decrypt(encryptedData, pin) {
        const cryptoUtils = await waitForLibrary('cryptoUtils');
        return await cryptoUtils.decrypt(encryptedData, pin);
    }
}

export const security = new WalletSecurity();

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
            }
        ];

        this.activeId = localStorage.getItem(this.activeIdKey) || 'mainnet';
    }

    getNetworks() {
        return [...this.defaultNetworks];
    }

    getActiveNetwork() {
        return this.getNetworks().find(n => n.id === this.activeId) || this.defaultNetworks[0];
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

export const networks = new NetworkManager();

// ===== 3. WALLET MANAGER MODULE =====
class WalletManager {
    constructor() {
        this.storageKey = 'paxi_wallets_v2';
        this.activeIdKey = 'paxi_active_wallet_id';
        this.wallets = this.loadWallets();
        this.activeId = localStorage.getItem(this.activeIdKey);
    }

    loadWallets() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    saveWallets() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.wallets));
        window.dispatchEvent(new CustomEvent('paxi_wallets_updated', { detail: this.wallets }));
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
            const w = this.getWallet(id);
            State.set('wallet', w);
            window.dispatchEvent(new CustomEvent('paxi_active_wallet_changed', { detail: id }));
            return true;
        }
        return false;
    }

    async addWallet(name, type, encryptedData, address, isWatchOnly = false) {
        const id = 'w_' + Date.now();
        const newWallet = { id, name, type, address, encryptedData, isWatchOnly };
        this.wallets.push(newWallet);
        this.saveWallets();
        this.setActiveWallet(id);
        return id;
    }
}

export const wallets = new WalletManager();

// ===== 4. ASSET MANAGER MODULE =====
class AssetManager {
    constructor() {
        this.metadata = new Map();
        this.paxiBalanceRaw = '0';
    }

    async fetchUserAssets(address) {
        try {
            const [data, paxiRes] = await Promise.all([
                fetchDirect(`https://explorer.paxinet.io/api/prc20/my_contract_accounts?address=${address}`),
                fetchDirect(`${APP_CONFIG.LCD}/cosmos/bank/v1beta1/balances/${address}`).catch(() => null)
            ]);
            
            if (paxiRes?.balances) {
                const b = paxiRes.balances.find(x => x.denom === 'upaxi');
                this.paxiBalanceRaw = b ? b.amount : '0';
            }

            if (data?.accounts) {
                const apiTokens = data.accounts.map(item => ({
                    address: item.contract.contract_address,
                    symbol: item.contract.symbol,
                    name: item.contract.name,
                    decimals: item.contract.decimals,
                    balance: item.account.balance,
                }));

                data.accounts.forEach(item => {
                    const c = item.contract;
                    this.metadata.set(c.contract_address, {
                        price: parseFloat(c.price_paxi || 0),
                        change24h: parseFloat(c.price_change || 0)
                    });
                });

                State.set('userAssets', apiTokens);
                window.dispatchEvent(new CustomEvent('paxi_assets_updated'));
            }
        } catch (e) {
            console.error("Failed to fetch user assets", e);
        }
    }

    getTokens() {
        return State.get('userAssets') || [];
    }

    getAssetMeta(address) {
        return this.metadata.get(address) || { price: 0, change24h: 0 };
    }
}

export const assets = new AssetManager();
