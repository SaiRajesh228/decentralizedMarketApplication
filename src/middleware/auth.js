const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate requests using JWT
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user by wallet address
      const user = await User.findOne({ walletAddress: decoded.walletAddress });
      
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      // Add user information to request object
      req.user = {
        walletAddress: user.walletAddress,
        role: user.role
      };
      
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to ensure user is an admin
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, admin only' });
  }
};

// Middleware to ensure user is a verified seller
exports.verifiedSellerOnly = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied, verified sellers only' });
  }
};

// Middleware to ensure user owns the resource
exports.isOwner = (idParam) => {
  return async (req, res, next) => {
    try {
      const id = req.params[idParam];
      
      if (!id) {
        return res.status(400).json({ message: `${idParam} parameter is required` });
      }
      
      // For different resource types, we need different ownership checks
      if (idParam === 'transactionId') {
        const Transaction = require('../models/Transaction');
        const transaction = await Transaction.findOne({ transactionId: id });
        
        if (!transaction) {
          return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Check if user is buyer or seller
        if (
          transaction.buyer === req.user.walletAddress || 
          transaction.seller === req.user.walletAddress || 
          req.user.role === 'admin'
        ) {
          return next();
        }
      } else if (idParam === 'componentId') {
        const Component = require('../models/Component');
        const component = await Component.findOne({ componentId: id });
        
        if (!component) {
          return res.status(404).json({ message: 'Component not found' });
        }
        
        // Check if user is the owner
        if (component.owner === req.user.walletAddress || req.user.role === 'admin') {
          return next();
        }
      } else if (idParam === 'productId') {
        const Product = require('../models/Product');
        const product = await Product.findOne({ productId: id });
        
        if (!product) {
          return res.status(404).json({ message: 'Product not found' });
        }
        
        // Check if user is the seller
        if (product.seller === req.user.walletAddress || req.user.role === 'admin') {
          return next();
        }
      }
      
      // If we get here, user doesn't own the resource
      return res.status(403).json({ message: 'Access denied, you do not own this resource' });
    } catch (error) {
      console.error('isOwner middleware error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  };
};