import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Decentralized Marketplace</h3>
            <p className="text-sm text-gray-300">
              A blockchain-powered platform for secure buying and selling with 
              transparent supply chain tracking.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/supply-chain" className="text-gray-300 hover:text-white">
                  Supply Chain
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  API
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Smart Contracts
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Discord
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-sm text-gray-400 text-center">
          <p>© {new Date().getFullYear()} Decentralized Marketplace. All rights reserved.</p>
          <p className="mt-2">Powered by Hedera Hashgraph and IPFS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;