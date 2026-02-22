const express = require('express');
const router = express.Router();
const presaleController = require('../controllers/presaleController');
const { validatePurchase } = require('../middleware/validation');

router.get('/tokens', presaleController.getTokens);
router.get('/tokens/:id', presaleController.getTokenDetail);
router.post('/purchase', validatePurchase, presaleController.submitPurchase);
router.get('/user/:address', presaleController.getUserHistory);

module.exports = router;
