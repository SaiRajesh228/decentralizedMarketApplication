const express = require('express');
const router = express.Router();
const supplyChainController = require('../controllers/supplyChainController');
const { protect, isOwner } = require('../middleware/auth');

// Public routes - no authentication needed
// GET /api/supply-chain/components/:componentId - Get component details
router.get('/components/:componentId', supplyChainController.getComponent);

// GET /api/supply-chain/components/:componentId/history - Get component history
router.get('/components/:componentId/history', supplyChainController.getComponentHistory);

// GET /api/supply-chain/components/search - Search components
router.get('/components/search', supplyChainController.searchComponents);

// Protected routes - require authentication
// POST /api/supply-chain/components - Register a new component
router.post('/components', protect, supplyChainController.registerComponent);

// POST /api/supply-chain/components/:componentId/events - Add tracking event
router.post('/components/:componentId/events', protect, supplyChainController.addTrackingEvent);

// PUT /api/supply-chain/components/:componentId/transfer - Transfer ownership
router.put('/components/:componentId/transfer', protect, isOwner('componentId'), supplyChainController.transferOwnership);

module.exports = router;