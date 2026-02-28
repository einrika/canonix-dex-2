const express = require('express');
const router = express.Router();

// Import controllers
const lcdProxy = require('../controllers/lcd-proxy');
const rpcProxy = require('../controllers/rpc-proxy');
const adminControl = require('../controllers/admin-control');
const aiAnalysis = require('../controllers/ai_analysis');
const config = require('../controllers/config');
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
const lpPosition = require('../controllers/prc20/lp-position');

// Map routes
router.all(/^\/lcd\/(.*)/, (req, res, next) => { req.params[0] = req.params[0]; next(); }, lcdProxy);
router.all(/^\/rpc\/(.*)/, (req, res, next) => { req.params[0] = req.params[0]; next(); }, rpcProxy);
router.all('/admin-control', adminControl);
router.post('/ai_analysis', aiAnalysis);
router.get('/config', config);
router.get('/gas-estimate', gasEstimate);
router.post('/gas-simulate', gasSimulate);
router.all('/proxy', proxy);
router.get('/token-detail', tokenDetail);
router.get('/token-list', tokenList);
router.get('/token-price', tokenPrice);
router.get('/token-validate', tokenValidate);
router.get('/tx-history', txHistory);
router.get('/tx-status', txStatus);

// Explorer API Compatibility Routes
router.get('/prc20/contracts', tokenList);
router.get('/prc20/contract', tokenDetail);
router.get('/prc20/search', tokenList);
router.get('/prc20/get_contract_prices', tokenPrice);
router.get('/prc20/my_contract_accounts', myContractAccounts);
router.get('/prc20/holders', holders);
router.get('/prc20/lp-position', lpPosition);

module.exports = router;
