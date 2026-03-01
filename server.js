const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const apiRoutes = require('./src/routes/api');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach Socket.io to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Cache Busting: HTML no-cache, Static assets allowed caching
app.use((req, res, next) => {
    const isHtml = req.url.includes('.html') || req.url === '/' || !path.extname(req.url.split('?')[0]);
    if (isHtml) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    } else {
        // Cache static assets (JS, CSS, images) for 1 day
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        const isHtml = filePath.endsWith('.html');
        if (isHtml) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
        } else {
            res.setHeader('Cache-Control', 'public, max-age=86400');
        }
    }
}));

// Fallback for SPA (Single Page Application)
app.use((req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket initialization & Feature Configuration
const features = require('./src/config/features');
const socketManager = require('./src/services/socket-io');

// Always initialize socket room management
socketManager.init(io);

if (features.ENABLE_GLOBAL_MONITOR) {
    const dataMonitor = require('./src/services/monitor');
    dataMonitor.init(io);
} else {
    console.log('[Server] Global Monitor is DISABLED');
}

if (features.ENABLE_CONTRACT_MONITOR) {
    const contractMonitor = require('./src/services/monitor-contract-details');
    contractMonitor.init(io);
} else {
    console.log('[Server] Contract Monitor is DISABLED');
}

if (features.ENABLE_PRICE_STREAMING) {
    const priceMonitor = require('./src/services/price-monitor-service');
    priceMonitor.init(io);
} else {
    console.log('[Server] Price Streaming is DISABLED');
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
});
