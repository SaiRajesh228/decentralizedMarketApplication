const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

// Check if we have the required environment variables
if (!process.env.PINATA_API_KEY || !process.env.PINATA_SECRET_API_KEY) {
  console.warn('Pinata API keys not found, IPFS functionality will be limited');
}

// Initialize Pinata client
const pinata = process.env.PINATA_API_KEY 
  ? new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY)
  : null;

/**
 * Test connection to Pinata
 * @returns {Object} Connection test result
 */
const testConnection = async () => {
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    const result = await pinata.testAuthentication();
    console.log('Pinata connection successful');
    return result;
  } catch (error) {
    console.error('Pinata connection failed:', error);
    throw error;
  }
};

/**
 * Upload JSON data to IPFS
 * @param {Object} jsonData - The data to upload
 * @param {string} name - Name for the upload
 * @returns {string} IPFS hash
 */
const uploadJSON = async (jsonData, name = '') => {
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    const options = {
      pinataMetadata: {
        name: name || `Upload-${Date.now()}`
      }
    };
    
    const result = await pinata.pinJSONToIPFS(jsonData, options);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error);
    throw error;
  }
};

/**
 * Upload a buffer to IPFS
 * @param {Buffer} buffer - Data buffer to upload
 * @param {string} name - Name for the upload
 * @returns {string} IPFS hash
 */
const uploadBuffer = async (buffer, name = '') => {
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    const options = {
      pinataMetadata: {
        name: name || `Buffer-${Date.now()}`
      }
    };
    
    const result = await pinata.pinFileToIPFS(buffer, options);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading buffer to IPFS:', error);
    throw error;
  }
};

/**
 * Upload a file to IPFS
 * @param {string} filePath - Path to the file
 * @param {string} name - Name for the upload
 * @returns {string} IPFS hash
 */
const uploadFile = async (filePath, name = '') => {
  if (!pinata) {
    throw new Error('Pinata client not initialized');
  }
  
  try {
    const readableStream = fs.createReadStream(filePath);
    const options = {
      pinataMetadata: {
        name: name || `File-${Date.now()}`
      }
    };
    
    const result = await pinata.pinFileToIPFS(readableStream, options);
    return result.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    throw error;
  }
};

/**
 * Get IPFS gateway URL for a hash
 * @param {string} hash - IPFS hash
 * @returns {string} Gateway URL
 */
const getIPFSUrl = (hash) => {
  if (!hash) {
    return null;
  }
  
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

module.exports = {
  testConnection,
  uploadJSON,
  uploadBuffer,
  uploadFile,
  getIPFSUrl
};