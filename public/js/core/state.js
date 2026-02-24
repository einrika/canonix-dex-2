// ============================================
// STATE.JS - Centralized Application State
// ============================================

class StateManager {
    constructor() {
        this.state = {
            wallet: null,
            paxiPrice: 0,
            currentToken: null,
            tokens: [],
            sidebarTab: 'wallet',
            poolData: null,
            userAssets: [],
            walletType: null,
            tradeType: 'buy'
        };
        this.listeners = new Map();
        this.globalListeners = [];
    }

    get(key) { return this.state[key]; }

    set(key, value) {
        this.state[key] = value;
        this.notify(key, value);
    }

    subscribe(key, callback) {
        if (typeof key === 'function') {
            this.globalListeners.push(key);
            return () => {
                this.globalListeners = this.globalListeners.filter(cb => cb !== key);
            };
        }

        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
        return () => {
            const list = this.listeners.get(key).filter(cb => cb !== callback);
            this.listeners.set(key, list);
        };
    }

    notify(key, value) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(cb => cb(value));
        }
        this.globalListeners.forEach(cb => cb(key, value));
    }
}

export const State = new StateManager();
