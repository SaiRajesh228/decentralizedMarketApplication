const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// GET /api/admin/users - Get all users
router.get('/users', adminController.getAllUsers);

// GET /api/admin/seller-requests - Get pending seller requests
router.get('/seller-requests', adminController.getPendingSellerRequests);

// PUT /api/admin/users/:walletAddress/approve-seller - Approve seller request
router.put('/users/:walletAddress/approve-seller', adminController.handleSellerRequest);

// PUT /api/admin/users/:walletAddress/revoke-seller - Revoke seller status
router.put('/users/:walletAddress/revoke-seller', adminController.revokeSeller);

// GET /api/admin/stats - Get marketplace statistics
router.get('/stats', adminController.getMarketplaceStats);

// Only super admin (owner) routes
// PUT /api/admin/users/:walletAddress/admin-status - Set admin status
router.put('/users/:walletAddress/admin-status', adminController.setAdminStatus);

module.exports = router;