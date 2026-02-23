// ============================================
// SOCKET.JS - WebSocket Client Manager (ES Module)
// ============================================

import { State } from './state.js';

export const PaxiSocket = {
    socket: null,
    currentRoom: null,
    isConnected: false,

    init: function() {
        if (this.socket) return;
        console.log('[Socket] Initializing connection...');

        if (window.io) {
            this.connect();
        } else {
            const script = document.createElement('script');
            script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
            script.onload = () => this.connect();
            document.head.appendChild(script);
        }
        this.setupVisibilityHandler();
    },

    connect: function() {
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('[Socket] Connected, ID:', this.socket.id);
            this.isConnected = true;
            if (this.currentRoom) this.socket.emit('subscribe_token', this.currentRoom);
            window.dispatchEvent(new CustomEvent('paxi_socket_connected'));
        });

        this.socket.on('disconnect', () => {
            this.isConnected = false;
            window.dispatchEvent(new CustomEvent('paxi_socket_disconnected'));
        });

        this.socket.on('token_list_update', (data) => {
            window.dispatchEvent(new CustomEvent('paxi_token_list_updated', { detail: data }));
        });

        this.socket.on('price_update', (data) => {
            window.dispatchEvent(new CustomEvent('paxi_price_updated_socket', { detail: data }));
        });

        this.socket.on('paxi_price_usd_update', (data) => {
            if (data.usd) {
                State.set('paxiPriceUSD', data.usd);
            }
        });
    },

    subscribeToken: function(address) {
        if (!this.socket) return;
        if (this.currentRoom && this.currentRoom !== address) this.unsubscribeToken(this.currentRoom);
        this.currentRoom = address;
        this.socket.emit('subscribe_token', address);
    },

    unsubscribeToken: function(address) {
        if (!this.socket || !address) return;
        this.socket.emit('unsubscribe_token', address);
        if (this.currentRoom === address) this.currentRoom = null;
    },

    setupVisibilityHandler: function() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                if (this.socket && this.socket.disconnected) this.socket.connect();
            } else {
                if (this.socket && this.socket.connected) this.socket.disconnect();
            }
        });
    },

    disconnect: function() {
        if (this.socket) this.socket.disconnect();
    }
};

window.addEventListener('beforeunload', () => PaxiSocket.disconnect());
