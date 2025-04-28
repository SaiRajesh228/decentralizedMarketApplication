import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { currentUser, requestSellerStatus } = useAuth();
  const [requesting, setRequesting] = useState(false);
  
  // Handle seller status request
  const handleSellerRequest = async () => {
    setRequesting(true);
    try {
      await requestSellerStatus();
      toast.success('Seller status requested successfully');
    } catch (error) {
      console.error('Failed to request seller status:', error);
      toast.error(error.response?.data?.message || 'Failed to request seller status');
    } finally {
      setRequesting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {/* User Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Account Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Name</p>
            <p className="font-medium">{currentUser.name}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Role</p>
            <p className="font-medium capitalize">{currentUser.role}</p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <p className="text-gray-500 text-sm">Wallet Address</p>
            <p className="font-mono bg-gray-100 p-2 rounded overflow-x-auto">
              {currentUser.walletAddress}
            </p>
          </div>
        </div>
      </div>
      
      {/* Seller Status */}
      {currentUser.role === 'buyer' && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Become a Seller</h2>
          <p className="text-gray-600 mb-4">
            Want to sell products on our marketplace? Request seller status now.
          </p>
          
          {currentUser.sellerRequest?.status === 'pending' ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
              <p className="text-yellow-700">
                Your seller request is currently pending approval. You'll be notified once it's processed.
              </p>
            </div>
          ) : currentUser.sellerRequest?.status === 'rejected' ? (
            <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
              <p className="text-red-700">
                Your seller request was rejected: {currentUser.sellerRequest.reason || 'No reason provided.'}
              </p>
              <button
                onClick={handleSellerRequest}
                disabled={requesting}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {requesting ? 'Submitting...' : 'Request Again'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSellerRequest}
              disabled={requesting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {requesting ? 'Submitting...' : 'Request Seller Status'}
            </button>
          )}
        </div>
      )}
      
      {/* Quick Links */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            to="/transactions" 
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-medium text-blue-600">Your Transactions</h3>
            <p className="text-sm text-gray-500">View your purchase history</p>
          </Link>
          
          {currentUser.role === 'seller' && (
            <Link 
              to="/seller-dashboard" 
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium text-blue-600">Seller Dashboard</h3>
              <p className="text-sm text-gray-500">Manage your products</p>
            </Link>
          )}
          
          {currentUser.role === 'admin' && (
            <Link 
              to="/admin" 
              className="p-4 border rounded-lg hover:bg-gray-50"
            >
              <h3 className="font-medium text-blue-600">Admin Dashboard</h3>
              <p className="text-sm text-gray-500">Manage the marketplace</p>
            </Link>
          )}
          
          <Link 
            to="/supply-chain" 
            className="p-4 border rounded-lg hover:bg-gray-50"
          >
            <h3 className="font-medium text-blue-600">Supply Chain</h3>
            <p className="text-sm text-gray-500">Track components you own</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;