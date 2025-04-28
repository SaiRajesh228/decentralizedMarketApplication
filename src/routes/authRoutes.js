const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public routes - no authentication needed
// GET /api/auth/nonce/:walletAddress - Get authentication nonce for a wallet
router.get('/nonce/:walletAddress', authController.getNonce);

// POST /api/auth/register - Register a new user
router.post('/register', authController.registerUser);

// POST /api/auth/login - Login with wallet signature
router.post('/login', authController.loginWithWallet);

// Protected routes - require authentication
// GET /api/auth/profile - Get current user's profile
router.get('/profile', protect, authController.getProfile);

// POST /api/auth/request-seller - Request seller status
router.post('/request-seller', protect, authController.requestSellerStatus);

module.exports = router;