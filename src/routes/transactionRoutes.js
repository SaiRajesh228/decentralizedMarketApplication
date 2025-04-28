const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { protect, isOwner } = require('../middleware/auth');

// All transaction routes require authentication
router.use(protect);

// POST /api/transactions/buy - Buy a product
router.post('/buy', transactionController.buyProduct);

// GET /api/transactions/:transactionId - Get a transaction by ID
router.get('/:transactionId', isOwner('transactionId'), transactionController.getTransaction);

// GET /api/transactions/user/:walletAddress - Get user's transactions
router.get('/user/:walletAddress', transactionController.getUserTransactions);

// PUT /api/transactions/:transactionId/confirm - Confirm delivery (seller only)
router.put('/:transactionId/confirm', isOwner('transactionId'), transactionController.confirmDelivery);

module.exports = router;