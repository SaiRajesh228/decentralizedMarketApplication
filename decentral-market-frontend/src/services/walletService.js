import { ethers } from 'ethers';

// Check if wallet is available
const isWalletAvailable = () => {
  return typeof window.ethereum !== 'undefined';
};

// Connect to wallet
const connectWallet = async () => {
  if (!isWalletAvailable()) {
    throw new Error('No Ethereum wallet extension detected');
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw error;
  }
};

// Sign message
const signMessage = async (message) => {
  if (!isWalletAvailable()) {
    throw new Error('No Ethereum wallet extension detected');
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw error;
  }
};

// Get current wallet address
const getCurrentAddress = async () => {
  if (!isWalletAvailable()) {
    return null;
  }
  
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.listAccounts();
    return accounts.length > 0 ? accounts[0].address : null;
  } catch (error) {
    console.error('Error getting current address:', error);
    return null;
  }
};

// Add network change listener
const addNetworkChangeListener = (callback) => {
  if (isWalletAvailable()) {
    window.ethereum.on('chainChanged', (chainId) => {
      callback(chainId);
    });
  }
};

// Add account change listener
const addAccountChangeListener = (callback) => {
  if (isWalletAvailable()) {
    window.ethereum.on('accountsChanged', (accounts) => {
      callback(accounts);
    });
  }
};

export default {
  isWalletAvailable,
  connectWallet,
  signMessage,
  getCurrentAddress,
  addNetworkChangeListener,
  addAccountChangeListener
};