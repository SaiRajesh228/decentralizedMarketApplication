const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // Blockchain reference
  transactionId: {
    type: Number,
    required: true,
    unique: true
  },
  
  // Product reference
  productId: {
    type: Number,
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  
  // Users involved
  buyer: {
    type: String,
    required: true,
    ref: 'User'
  },
  seller: {
    type: String,
    required: true,
    ref: 'User'
  },
  
  // Transaction details
  price: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['paid', 'delivered'],
    default: 'paid'
  },
  
  // Timestamps
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  deliveryDate: {
    type: Date
  }
});

// Create indices for faster lookups
TransactionSchema.index({ buyer: 1 });
TransactionSchema.index({ seller: 1 });
TransactionSchema.index({ productId: 1 });
TransactionSchema.index({ status: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);