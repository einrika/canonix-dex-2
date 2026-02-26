/**
 * Socket.io Connection & Room Management
 */

const init = (io) => {
    console.log('[Socket] Initializing room management...');

    io.on('connection', (socket) => {
        // Sidebar subscription
        socket.on('subscribe_sidebar', () => {
            socket.join('sidebar');
        });

        socket.on('unsubscribe_sidebar', () => {
            socket.leave('sidebar');
        });

        // Token room subscription
        socket.on('subscribe_token', (address) => {
            if (!address) return;
            socket.join(`token_${address}`);
        });

        socket.on('unsubscribe_token', (address) => {
            if (!address) return;
            socket.leave(`token_${address}`);
        });
    });
};

module.exports = { init };
