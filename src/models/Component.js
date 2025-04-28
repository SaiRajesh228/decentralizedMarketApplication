const mongoose = require('mongoose');

const ComponentSchema = new mongoose.Schema({
  // Blockchain reference
  componentId: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Basic component information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  
  // Ownership information
  creator: {
    type: String,
    required: true,
    ref: 'User'
  },
  owner: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Status
  isActive: {
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
  
  // Tracking history
  trackingEvents: [{
    eventType: {
      type: String,
      required: true
    },
    actor: {
      type: String,
      required: true,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String
    }
  }]
});

// Create indices for faster lookups
ComponentSchema.index({ creator: 1 });
ComponentSchema.index({ owner: 1 });
ComponentSchema.index({ type: 1 });
ComponentSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Component', ComponentSchema);