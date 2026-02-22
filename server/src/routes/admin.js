const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateAdmin } = require('../middleware/auth');
const { validateToken } = require('../middleware/validation');

router.post('/login', adminController.login);

// Protected Routes
router.use(authenticateAdmin);

router.post('/tokens', validateToken, adminController.createToken);
router.put('/tokens/:id', adminController.updateToken);
router.get('/transactions', adminController.getAllTransactions);
router.post('/manual-approve/:id', adminController.manualApprove);

module.exports = router;
