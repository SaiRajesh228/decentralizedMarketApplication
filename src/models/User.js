const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic user information
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    default: 'Anonymous User'
  },
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  
  // Authentication
  nonce: {
    type: String,
    required: true,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },
  
  // Registration and activity timestamps
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  
  // Seller request information
  sellerRequest: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'revoked'],
    },
    requestDate: {
      type: Date
    },
    processedAt: {
      type: Date
    },
    processedBy: {
      type: String
    },
    reason: {
      type: String
    },
    businessInfo: {
      type: String
    },
    contactInfo: {
      type: String
    }
  },
  
  // Additional profile information
  profileData: {
    type: Object,
    default: {}
  }
});

// Method to update nonce for security
UserSchema.methods.updateNonce = function() {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.save();
};

module.exports = mongoose.model('User', UserSchema);