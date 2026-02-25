const cron = require('node-cron');
const indexerService = require('../services/indexerService');
const { secureLogger } = require('../utils/common');

const initWorkers = () => {
    secureLogger.log('Initializing indexer workers...');

    // Run token indexing every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
        secureLogger.log('Scheduled Task: Token Indexing');
        await indexerService.indexAllTokens();
    });

    // We can add more scheduled tasks here

    // Run once on startup
    setTimeout(async () => {
        secureLogger.log('Initial Task: Token Indexing');
        await indexerService.indexAllTokens();
    }, 5000);
};

module.exports = { initWorkers };
