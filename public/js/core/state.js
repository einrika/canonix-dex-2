/**
 * STATE.JS - Centralized Reactive State Manager
 * Provides a simple Pub/Sub mechanism for global application state.
 */

class StateManager {
    constructor() {
        this.state = {
            wallet: null,
            paxiPriceUSD: 0.05,
            currentPRC20: '',
            tokenDetails: new Map(),
            poolData: null,
            txHistory: [],
            activeNetwork: 'paxi-mainnet',
            settings: {
                slippage: 0.5,
                enableResultModal: localStorage.getItem('paxi_enable_result_modal') !== 'false'
            }
        };
        this.listeners = new Map();
    }

    /**
     * Get a value from the state
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Set a value in the state and notify subscribers
     */
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;

        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(value, oldValue));
        }

        // Also trigger a global event for legacy compatibility if needed
        window.dispatchEvent(new CustomEvent(`state_${key}_updated`, { detail: { value, oldValue } }));
    }

    /**
     * Subscribe to changes for a specific key
     */
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);

        // Return unsubscribe function
        return () => {
            const list = this.listeners.get(key);
            const idx = list.indexOf(callback);
            if (idx !== -1) list.splice(idx, 1);
        };
    }

    /**
     * Batch update multiple state keys
     */
    update(obj) {
        Object.keys(obj).forEach(key => this.set(key, obj[key]));
    }
}

export const State = new StateManager();
