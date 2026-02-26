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

// API Routes
app.use('/api', apiRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback for SPA (Single Page Application)
app.use((req, res) => {
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

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local: http://localhost:${PORT}`);
});
