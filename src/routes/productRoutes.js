const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, verifiedSellerOnly } = require('../middleware/auth');

// Public routes - no authentication needed
// GET /api/products - Get all products with optional filtering
router.get('/', productController.getProducts);

// GET /api/products/:productId - Get a single product by ID
router.get('/:productId', productController.getProductById);

// GET /api/products/seller/:walletAddress - Get products by seller
router.get('/seller/:walletAddress', productController.getSellerProducts);

// Protected routes - require authentication
// POST /api/products - List a new product (sellers only)
router.post('/', protect, verifiedSellerOnly, productController.listProduct);

// PUT /api/products/:productId/unavailable - Mark product as unavailable
// This is typically called internally by the transaction controller
router.put('/:productId/unavailable', protect, productController.markProductUnavailable);

module.exports = router;