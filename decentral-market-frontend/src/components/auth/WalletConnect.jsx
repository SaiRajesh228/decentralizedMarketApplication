import React, { useState } from 'react';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';

const WalletConnect = () => {
  const [connecting, setConnecting] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const { loginWithWallet, registerUser } = useAuth();

  // Connect wallet and sign message to authenticate
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Metamask or a compatible wallet is required!');
      return;
    }

    setConnecting(true);

    try {
      // Request wallet connection
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const address = accounts[0];
      setWalletAddress(address);

      // Check if user exists and get nonce
      try {
        const { data } = await apiService.getNonce(address);
        const message = `Sign this message: ${data.nonce}`;
        
        // Request user to sign message
        const signer = await provider.getSigner();
        const signature = await signer.signMessage(message);
        
        // Login with signature
        await loginWithWallet(address, signature);
      } catch (error) {
        // If 404 - user not found, register new user
        if (error.response && error.response.status === 404) {
          const name = prompt('Enter your name to register:');
          if (name) {
            await registerUser(address, name);
            
            // After registration, get new nonce and login
            const { data } = await apiService.getNonce(address);
            const message = `Sign this message: ${data.nonce}`;
            
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);
            
            await loginWithWallet(address, signature);
          }
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast.error('Failed to connect wallet: ' + (error.message || 'Unknown error'));
    } finally {
      setConnecting(false);
    }
  };

  return (
    <button
      onClick={connectWallet}
      disabled={connecting}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
    >
      {connecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
};

export default WalletConnect;