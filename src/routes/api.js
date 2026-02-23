const express = require('express');
const router = express.Router();

// Import controllers
const adminControl = require('../controllers/admin-control');
const aiAnalysis = require('../controllers/ai_analysis');
const gasEstimate = require('../controllers/gas-estimate');
const gasSimulate = require('../controllers/gas-simulate');
const proxy = require('../controllers/proxy');
const tokenDetail = require('../controllers/token-detail');
const tokenList = require('../controllers/token-list');
const tokenPrice = require('../controllers/token-price');
const tokenValidate = require('../controllers/token-validate');
const txHistory = require('../controllers/tx-history');
const txStatus = require('../controllers/tx-status');
const myContractAccounts = require('../controllers/prc20/my_contract_accounts');
const holders = require('../controllers/prc20/holders');
const { paxiPriceHandler } = require('../controllers/price');
const {
    smartQueryHandler,
    poolDataHandler,
    allPoolsHandler,
    lpPositionHandler,
    accountHandler,
    paxiBalanceHandler,
    rpcStatusHandler,
    rpcTxHandler,
    txDetailHandler,
    getWalletDataHandler,
    broadcastHandler
} = require('../controllers/blockchain');

// Map routes
router.all('/admin-control', adminControl);
router.post('/ai_analysis', aiAnalysis);
router.get('/gas-estimate', gasEstimate);
router.post('/gas-simulate', gasSimulate);
router.all('/proxy', proxy);
router.get('/token-detail', tokenDetail);
router.get('/token-list', tokenList);
router.get('/token-price', tokenPrice);
router.get('/token-validate', tokenValidate);
router.get('/tx-history', txHistory);
router.get('/tx-status', txStatus);

// New Backend API Routes
router.get('/paxi-price', paxiPriceHandler);
router.get('/smart-query', smartQueryHandler);
router.get('/pool', poolDataHandler);
router.get('/pools', allPoolsHandler);
router.get('/all-pools', allPoolsHandler);
router.get('/lp-position', lpPositionHandler);
router.get('/account', accountHandler);
router.get('/paxi-balance', paxiBalanceHandler);
router.get('/rpc-status', rpcStatusHandler);
router.get('/rpc-tx', rpcTxHandler);
router.get('/tx-detail', txDetailHandler);
router.get('/wallet-data', getWalletDataHandler);
router.post('/broadcast', broadcastHandler);
router.get('/wallet-tokens', myContractAccounts);
router.get('/holders', holders);

// Explorer API Compatibility Routes
router.get('/prc20/contracts', tokenList);
router.get('/prc20/contract', tokenDetail);
router.get('/prc20/search', tokenList);
router.get('/prc20/get_contract_prices', tokenPrice);
router.get('/prc20/my_contract_accounts', myContractAccounts);
router.get('/prc20/holders', holders);

module.exports = router;
