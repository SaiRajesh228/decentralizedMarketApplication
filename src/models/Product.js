const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  // Blockchain reference
  productId: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Basic product information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true
  },
  
  // Seller information
  seller: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Availability
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  // IPFS data
  ipfsHash: {
    type: String
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search functionality
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

// Pre-save hook to update the "updatedAt" timestamp
ProductSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Product', ProductSchema);