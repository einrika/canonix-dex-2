// ============================================
// SOCKET.JS - Real-time Updates via Socket.IO
// ============================================

import { APP_CONFIG } from './config.js';
import { State } from './state.js';

export const PaxiSocket = {
    socket: null,
    connected: false,

    init: function() {
        if (!window.io) {
            console.warn('[Socket] Socket.IO not found on window');
            return;
        }
        this.connect();
    },

    connect: function() {
        this.socket = window.io(APP_CONFIG.BACKEND_API);

        this.socket.on('connect', () => {
            console.log('[Socket] Connected, ID:', this.socket.id);
            this.connected = true;
            const token = State.get('currentToken');
            if (token) this.subscribeToken(token.address);
        });

        this.socket.on('price_update', (data) => {
            const currentToken = State.get('currentToken');
            if (currentToken && data.address === currentToken.address) {
                State.set('currentToken', { ...currentToken, ...data });
            }
            window.dispatchEvent(new CustomEvent('paxi_price_update', { detail: data }));
        });

        this.socket.on('disconnect', () => {
            this.connected = false;
        });
    },

    subscribeToken: function(address) {
        if (this.socket?.connected) {
            this.socket.emit('subscribe', { address });
        }
    },

    unsubscribeToken: function(address) {
        if (this.socket?.connected) {
            this.socket.emit('unsubscribe', { address });
        }
    }
};
