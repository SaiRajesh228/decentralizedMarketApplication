import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Decentralized Marketplace</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A blockchain-powered platform where you can buy and sell products securely,
          with transparent supply chain tracking and ownership verification.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            to="/marketplace" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Marketplace
          </Link>
          <Link 
            to="/supply-chain" 
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Supply Chain Tracking
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Secure Transactions</h2>
          <p className="text-gray-600">
            All transactions are recorded on the blockchain, ensuring transparency
            and security for both buyers and sellers.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Verified Sellers</h2>
          <p className="text-gray-600">
            Sellers on our platform are verified to ensure the highest quality
            and trustworthiness of products.
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-3">Component Tracking</h2>
          <p className="text-gray-600">
            Track the origin, history, and ownership transfers of components
            in the supply chain.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;