// ============================================
// SOCKET.JS - WebSocket Client Manager
// ============================================

window.PaxiSocket = {
    socket: null,
    currentRoom: null,
    isConnected: false,

    init: function() {
        if (this.socket) return;

        console.log('[Socket] Initializing connection...');

        // Load socket.io-client from CDN
        const script = document.createElement('script');
        script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
        script.onload = () => {
            this.connect();
        };
        document.head.appendChild(script);

        this.setupVisibilityHandler();
    },

    connect: function() {
        // Connect to same origin
        this.socket = io();

        this.socket.on('connect', () => {
            console.log('[Socket] Connected to backend, ID:', this.socket.id);
            this.isConnected = true;

            // Re-subscribe if we were in a room
            if (this.currentRoom) {
                this.socket.emit('subscribe_token', this.currentRoom);
            }

            window.dispatchEvent(new CustomEvent('paxi_socket_connected'));
        });

        this.socket.on('disconnect', () => {
            console.log('[Socket] Disconnected');
            this.isConnected = false;
            window.dispatchEvent(new CustomEvent('paxi_socket_disconnected'));
        });

        // Global token list updates
        this.socket.on('token_list_update', (data) => {
            window.dispatchEvent(new CustomEvent('paxi_token_list_updated', { detail: data }));
        });

        // Specific price updates
        this.socket.on('price_update', (data) => {
            window.dispatchEvent(new CustomEvent('paxi_price_updated_socket', { detail: data }));
        });

        // Global PAXI USD price update
        this.socket.on('paxi_price_usd_update', (data) => {
            if (data.usd) {
                window.paxiPriceUSD = data.usd;
                window.lastPaxiFetch = Date.now();
                window.dispatchEvent(new CustomEvent('paxi_price_updated', { detail: data.usd }));
            }
        });
    },

    subscribeToken: function(address) {
        if (!this.socket) return;

        if (this.currentRoom && this.currentRoom !== address) {
            this.unsubscribeToken(this.currentRoom);
        }

        this.currentRoom = address;
        this.socket.emit('subscribe_token', address);
        console.log('[Socket] Subscribed to token:', address);
    },

    unsubscribeToken: function(address) {
        if (!this.socket || !address) return;
        this.socket.emit('unsubscribe_token', address);
        if (this.currentRoom === address) this.currentRoom = null;
        console.log('[Socket] Unsubscribed from token:', address);
    },

    setupVisibilityHandler: function() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                console.log('[Socket] Tab visible, ensuring connection...');
                if (this.socket && this.socket.disconnected) {
                    this.socket.connect();
                }
            } else {
                console.log('[Socket] Tab hidden, disconnecting to save resources...');
                if (this.socket && this.socket.connected) {
                    this.socket.disconnect();
                }
            }
        });
    },

    disconnect: function() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
};

// Cleanup on unload
window.addEventListener('beforeunload', () => {
    window.PaxiSocket.disconnect();
});

// Initialize on load
window.addEventListener('load', () => {
    window.PaxiSocket.init();
});
