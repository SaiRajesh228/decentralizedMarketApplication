const Transaction = require('../models/Transaction');
const Product = require('../models/Product');
const { executeContract } = require('../utils/hederaClient');

// Buy a product
exports.buyProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    
    // Find product in database
    const product = await Product.findOne({ productId, isAvailable: true });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found or unavailable' });
    }
    
    // Check if buyer is not the seller
    if (req.user.walletAddress === product.seller) {
      return res.status(400).json({ message: 'Cannot buy your own product' });
    }
    
    // Execute transaction on blockchain
    let result;
    try {
      result = await executeContract(
        process.env.MARKETPLACE_CONTRACT_ADDRESS,
        'buyProduct',
        [productId],
        product.price // Send payment amount
      );
    } catch (blockchainError) {
      // If blockchain transaction fails, return error without changing product status
      return res.status(500).json({ 
        message: 'Blockchain transaction failed',
        error: blockchainError.message
      });
    }
    
    // If we get here, blockchain transaction was successful
    
    // Get transaction ID from blockchain result
    const transactionId = result.transactionId;
    
    // Create transaction record in database
    const transaction = new Transaction({
      transactionId,
      productId,
      product: product._id,
      buyer: req.user.walletAddress,
      seller: product.seller,
      price: product.price,
      status: 'paid', // Payment successful, awaiting delivery
      purchaseDate: new Date()
    });
    
    await transaction.save();
    
    // NOW it's safe to mark product as unavailable
    product.isAvailable = false;
    await product.save();
    
    res.status(201).json({
      message: 'Purchase successful',
      transaction: {
        transactionId,
        productId,
        price: product.price,
        status: 'paid'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Purchase failed' });
  }
};

// Confirm delivery (seller only)
exports.confirmDelivery = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Find transaction in database
    const transaction = await Transaction.findOne({ transactionId });
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if requester is the seller
    if (req.user.walletAddress !== transaction.seller) {
      return res.status(403).json({ message: 'Only the seller can confirm delivery' });
    }
    
    // Check if already delivered
    if (transaction.status === 'delivered') {
      return res.status(400).json({ message: 'Delivery already confirmed' });
    }
    
    // Confirm delivery on blockchain
    await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'confirmDelivery',
      [transactionId]
    );
    
    // Update transaction in database
    transaction.status = 'delivered';
    transaction.deliveryDate = new Date();
    await transaction.save();
    
    res.json({
      message: 'Delivery confirmed successfully',
      transaction: {
        transactionId,
        status: 'delivered',
        deliveryDate: transaction.deliveryDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm delivery' });
  }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    // Find transaction in database
    const transaction = await Transaction.findOne({ transactionId })
      .populate('product');  // Get product details
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user is buyer or seller
    if (req.user.walletAddress !== transaction.buyer && 
        req.user.walletAddress !== transaction.seller && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }
    
    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get transaction' });
  }
};

// Get user's transactions (purchases and/or sales)
exports.getUserTransactions = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { type = 'all' } = req.query;  // 'all', 'purchases', or 'sales'
    
    // Check if user is requesting their own transactions or is admin
    if (req.user.walletAddress !== walletAddress && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view these transactions' });
    }
    
    // Build query
    let query = {};
    
    if (type === 'purchases') {
      query.buyer = walletAddress;
    } else if (type === 'sales') {
      query.seller = walletAddress;
    } else {
      // 'all' - both purchases and sales
      query.$or = [{ buyer: walletAddress }, { seller: walletAddress }];
    }
    
    // Find transactions
    const transactions = await Transaction.find(query)
      .populate('product')
      .sort({ purchaseDate: -1 });  // Most recent first
    
    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get transactions' });
  }
};