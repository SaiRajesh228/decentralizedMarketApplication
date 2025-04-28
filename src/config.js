const dotenv = require('dotenv');
dotenv.config();

// Default configuration values
const defaults = {
  port: 5000,
  mongoUri: 'mongodb://localhost:27017/decentralMarketplace',
  jwtSecret: 'default_jwt_secret_change_this_in_production',
  jwtExpire: '24h',
  environment: 'development',
  hederaNetwork: 'testnet'
};

// Configuration object
const config = {
  // Server configuration
  port: process.env.PORT || defaults.port,
  
  // Database configuration
  mongoUri: process.env.MONGODB_URI || defaults.mongoUri,
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || defaults.jwtSecret,
    expire: process.env.JWT_EXPIRE || defaults.jwtExpire
  },
  
  // Blockchain configuration
  contracts: {
    marketplaceAddress: process.env.MARKETPLACE_CONTRACT_ADDRESS,
    supplyChainAddress: process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS
  },
  
  // Hedera configuration
  hedera: {
    accountId: process.env.HEDERA_ACCOUNT_ID,
    privateKey: process.env.HEDERA_PRIVATE_KEY,
    network: process.env.HEDERA_NETWORK || defaults.hederaNetwork
  },
  
  // IPFS configuration
  ipfs: {
    pinataApiKey: process.env.PINATA_API_KEY,
    pinataSecretApiKey: process.env.PINATA_SECRET_API_KEY,
    gateway: process.env.IPFS_GATEWAY || 'https://gateway.pinata.cloud'
  },
  
  // Environment
  environment: process.env.NODE_ENV || defaults.environment,
  isDevelopment: (process.env.NODE_ENV || defaults.environment) === 'development',
  isProduction: (process.env.NODE_ENV || defaults.environment) === 'production'
};

// Warning for missing critical configuration
if (!config.jwt.secret || config.jwt.secret === defaults.jwtSecret) {
  console.warn('WARNING: Using default JWT secret. Set JWT_SECRET in environment for security.');
}

if (!config.contracts.marketplaceAddress) {
  console.warn('WARNING: Marketplace contract address not set. Set MARKETPLACE_CONTRACT_ADDRESS in environment.');
}

if (!config.contracts.supplyChainAddress) {
  console.warn('WARNING: Supply chain contract address not set. Set SUPPLY_CHAIN_CONTRACT_ADDRESS in environment.');
}

module.exports = config;