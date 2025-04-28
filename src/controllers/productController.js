const Product = require('../models/Product');
const { executeContract } = require('../utils/hederaClient');
const { uploadToIPFS } = require('../utils/ipfsClient');

// List a new product (seller only)
exports.listProduct = async (req, res) => {
  try {
    const { name, description, price, image } = req.body;
    
    // Upload image to IPFS if provided
    let ipfsHash = '';
    if (image) {
      ipfsHash = await uploadToIPFS(image);
    }
    
    // Create product on blockchain
    const result = await executeContract(
      process.env.MARKETPLACE_CONTRACT_ADDRESS,
      'listProduct',
      [ipfsHash, price]
    );
    
    // Get product ID from blockchain result
    const productId = result.productId;
    
    // Create product in database
    const product = new Product({
      productId,
      name,
      description,
      price,
      seller: req.user.walletAddress,
      ipfsHash,
      isAvailable: true,
      createdAt: new Date()
    });
    
    await product.save();
    
    res.status(201).json({
      message: 'Product listed successfully',
      product: {
        productId,
        name,
        price,
        ipfsHash
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to list product' });
  }
};

// Get all products with optional filtering
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    
    // Build filter object
    const filter = { isAvailable: true };
    
    if (category) {
      filter.category = category;
    }
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // Get products from database
    const products = await Product.find(filter);
    
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get products' });
  }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find product in database
    const product = await Product.findOne({ productId });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get product' });
  }
};

// Get products by seller
exports.getSellerProducts = async (req, res) => {
  try {
    const { walletAddress } = req.params;
    
    // Find products in database
    const products = await Product.find({ seller: walletAddress });
    
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get seller products' });
  }
};

// Mark product as unavailable (when purchased)
exports.markProductUnavailable = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find product in database
    const product = await Product.findOne({ productId });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update product
    product.isAvailable = false;
    await product.save();
    
    res.json({ message: 'Product marked as unavailable' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product' });
  }
};