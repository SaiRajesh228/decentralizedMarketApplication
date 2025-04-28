// Import only what we need
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { executeContract } = require('../utils/hederaClient');

// Helper function to create a login token
function generateToken(user) {
  return jwt.sign(
    { walletAddress: user.walletAddress, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { walletAddress, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ walletAddress });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Register on blockchain
    await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'registerUser',
      []
    );
    
    // Create user in database
    const user = new User({
      walletAddress,
      name: name || 'User',
      role: 'buyer',
      nonce: Math.floor(Math.random() * 1000000)
    });
    
    await user.save();
    
    res.status(201).json({ 
      message: 'Registration successful',
      user: { walletAddress, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Get login challenge (nonce)
exports.getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ 
      nonce: user.nonce,
      message: `Sign this message: ${user.nonce}` 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error getting nonce' });
  }
};

// Login with wallet
exports.loginWithWallet = async (req, res) => {
  try {
    const { walletAddress, signature } = req.body;
    
    // Get user
    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check blockchain for roles
    const isAdmin = await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'isAdmin',
      [walletAddress],
      true
    );
    
    const isSeller = await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'isSeller',
      [walletAddress],
      true
    );
    
    // Update role if needed
    if (isAdmin) {
      user.role = 'admin';
    } else if (isSeller) {
      user.role = 'seller';
    }
    
    // Update nonce
    user.nonce = Math.floor(Math.random() * 1000000);
    await user.save();
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      token,
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Login failed' });
  }
};

// Request seller status
exports.requestSellerStatus = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'seller' || user.role === 'admin') {
      return res.status(400).json({ message: 'Already a seller or admin' });
    }
    
    user.sellerRequest = {
      status: 'pending',
      date: new Date()
    };
    
    await user.save();
    
    res.json({ message: 'Seller status requested' });
  } catch (error) {
    res.status(500).json({ message: 'Request failed' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        walletAddress: user.walletAddress,
        name: user.name,
        role: user.role,
        sellerRequest: user.sellerRequest
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get profile' });
  }
};