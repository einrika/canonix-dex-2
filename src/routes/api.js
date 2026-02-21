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
const myContractAccounts = require('../controllers/prc20/my_contract_accounts');

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
router.get('/prc20/my_contract_accounts', myContractAccounts);

module.exports = router;
