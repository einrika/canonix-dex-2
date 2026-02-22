const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { rateLimiter } = require('./middleware/validation');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const queueService = require('./services/queueService');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/api/presale', publicRoutes);
app.use('/api/admin', adminRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: 'PAXI Network Presale API is running' });
});

// Start queue service
queueService.start();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
