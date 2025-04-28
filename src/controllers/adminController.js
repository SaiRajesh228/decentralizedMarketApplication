const User = require('../models/User');
const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const { executeContract } = require('../utils/hederaClient');

// Approve or reject a seller request
exports.handleSellerRequest = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { approve, reason } = req.body;
    
    // Validate input
    if (approve === undefined) {
      return res.status(400).json({ message: 'approve parameter is required (true or false)' });
    }
    
    // Find user in database
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if there's a pending request
    if (!user.sellerRequest || user.sellerRequest.status !== 'pending') {
      return res.status(400).json({ message: 'No pending seller request found for this user' });
    }
    
    if (approve) {
      // Update seller status on blockchain
      await executeContract(
        process.env.MARKETPLACE_CONTRACT_ADDRESS,
        'setSellerStatus',
        [walletAddress, true]
      );
      
      // Update user in database to seller
      user.role = 'seller';
      user.sellerRequest.status = 'approved';
      user.sellerRequest.processedAt = new Date();
      user.sellerRequest.processedBy = req.user.walletAddress;
      user.sellerRequest.reason = reason || 'Request approved';
    } else {
      // Request rejected, don't change role but update request status
      user.sellerRequest.status = 'rejected';
      user.sellerRequest.processedAt = new Date();
      user.sellerRequest.processedBy = req.user.walletAddress;
      user.sellerRequest.reason = reason || 'Request rejected';
    }
    
    await user.save();
    
    res.json({
      message: `Seller request ${approve ? 'approved' : 'rejected'}`,
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        sellerRequest: user.sellerRequest
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process seller request' });
  }
};

// Revoke seller status (for existing sellers)
exports.revokeSeller = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { reason } = req.body;
    
    // Find user in database
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is actually a seller
    if (user.role !== 'seller') {
      return res.status(400).json({ message: 'User is not a seller' });
    }
    
    // Revoke seller status on blockchain
    await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'setSellerStatus',
      [walletAddress, false]
    );
    
    // Update user in database
    user.role = 'buyer';
    
    // Record the revocation
    user.sellerRequest = {
      status: 'revoked',
      processedAt: new Date(),
      processedBy: req.user.walletAddress,
      reason: reason || 'Seller status revoked'
    };
    
    await user.save();
    
    res.json({
      message: 'Seller status revoked successfully',
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to revoke seller status' });
  }
};

// Get pending seller requests
exports.getPendingSellerRequests = async (req, res) => {
  try {
    // Find users with pending seller requests
    const pendingRequests = await User.find({ 
      'sellerRequest.status': 'pending'
    });
    
    res.json({ pendingRequests });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get pending requests' });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Find all users
    const users = await User.find();
    
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get users' });
  }
};

// Get marketplace statistics
exports.getMarketplaceStats = async (req, res) => {
  try {
    // Count users by role
    const totalUsers = await User.countDocuments();
    const buyers = await User.countDocuments({ role: 'buyer' });
    const sellers = await User.countDocuments({ role: 'seller' });
    const admins = await User.countDocuments({ role: 'admin' });
    
    // Count products
    const totalProducts = await Product.countDocuments();
    const availableProducts = await Product.countDocuments({ isAvailable: true });
    
    // Count transactions
    const totalTransactions = await Transaction.countDocuments();
    const pendingDeliveries = await Transaction.countDocuments({ status: 'paid' });
    const completedDeliveries = await Transaction.countDocuments({ status: 'delivered' });
    
    // Calculate transaction volume (sum of all transaction prices)
    const transactionData = await Transaction.aggregate([
      {
        $group: {
          _id: null,
          totalVolume: { $sum: '$price' },
          averagePrice: { $avg: '$price' }
        }
      }
    ]);
    
    const transactionVolume = transactionData.length > 0 ? transactionData[0].totalVolume : 0;
    const averagePrice = transactionData.length > 0 ? transactionData[0].averagePrice : 0;
    
    res.json({
      users: {
        total: totalUsers,
        buyers,
        sellers,
        admins
      },
      products: {
        total: totalProducts,
        available: availableProducts,
        sold: totalProducts - availableProducts
      },
      transactions: {
        total: totalTransactions,
        pending: pendingDeliveries,
        completed: completedDeliveries,
        volume: transactionVolume,
        averagePrice
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get marketplace statistics' });
  }
};

// Set admin status (super admin only)
exports.setAdminStatus = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const { isAdmin } = req.body;
    
    // Validate input
    if (isAdmin === undefined) {
      return res.status(400).json({ message: 'isAdmin parameter is required (true or false)' });
    }
    
    // Find user in database
    const user = await User.findOne({ walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update admin status on blockchain
    await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'setAdminStatus',
      [walletAddress, isAdmin]
    );
    
    // Update user in database
    user.role = isAdmin ? 'admin' : 'buyer';
    await user.save();
    
    res.json({
      message: `Admin status ${isAdmin ? 'granted' : 'revoked'} successfully`,
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update admin status' });
  }
};