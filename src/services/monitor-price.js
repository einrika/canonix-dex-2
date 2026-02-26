const fetch = require('node-fetch');

let ioInstance = null;
let monitorInterval = null;

const cache = {
    tokenPrices: new Map() // address -> data
};

const init = (io) => {
    ioInstance = io;
    console.log('[Monitor-Price] Realtime price monitoring initialized');

    io.on('connection', (socket) => {
        socket.on('subscribe_token', async (tokenAddress) => {
            if (tokenAddress) {
                socket.join(`token_${tokenAddress}`);

                // Immediate delivery if cached
                if (cache.tokenPrices.has(tokenAddress)) {
                    socket.emit('price_update', cache.tokenPrices.get(tokenAddress));
                } else {
                    const data = await fetchTokenPrice(tokenAddress);
                    if (data) socket.emit('price_update', data);
                }
            }
        });

        socket.on('unsubscribe_token', (tokenAddress) => {
            if (tokenAddress) {
                socket.leave(`token_${tokenAddress}`);
            }
        });
    });

    startMonitoring();
};

const startMonitoring = () => {
    if (monitorInterval) clearInterval(monitorInterval);

    monitorInterval = setInterval(async () => {
        const connections = await ioInstance.fetchSockets();
        if (connections.length === 0) return;

        const rooms = Array.from(ioInstance.sockets.adapter.rooms.keys())
            .filter(room => room.startsWith('token_'));

        if (rooms.length === 0) return;

        try {
            for (const room of rooms) {
                const address = room.replace('token_', '');
                const data = await fetchTokenPrice(address);
                if (data) {
                    ioInstance.to(room).emit('price_update', data);
                }
            }
        } catch (e) {
            console.error('[Monitor-Price] Loop error:', e.message);
        }
    }, 5000);
};

const fetchTokenPrice = async (address) => {
    try {
        const url = `https://explorer.paxinet.io/api/prc20/contract?address=${address}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();

        if (data && data.contract) {
            const now = Math.floor(Date.now() / 5000) * 5000;
            const payload = {
                address: address,
                price_paxi: data.contract.price_paxi,
                price_change: data.contract.price_change,
                reserve_paxi: data.contract.reserve_paxi,
                reserve_prc20: data.contract.reserve_prc20,
                volume_24h: data.contract.volume,
                timestamp: now
            };
            cache.tokenPrices.set(address, payload);
            return payload;
        }
    } catch (e) { }
    return null;
};

module.exports = { init };
