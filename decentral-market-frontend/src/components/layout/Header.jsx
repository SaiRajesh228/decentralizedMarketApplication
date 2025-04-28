import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import WalletConnect from '../auth/WalletConnect';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  return (
    <header className="bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">
            Decentralized Marketplace
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-4">
            <Link to="/marketplace" className="px-3 py-2 hover:text-gray-300">
              Marketplace
            </Link>
            <Link to="/supply-chain" className="px-3 py-2 hover:text-gray-300">
              Supply Chain
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/transactions" className="px-3 py-2 hover:text-gray-300">
                  Transactions
                </Link>
                {currentUser.role === 'seller' && (
                  <Link to="/seller-dashboard" className="px-3 py-2 hover:text-gray-300">
                    Seller Dashboard
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="px-3 py-2 hover:text-gray-300">
                    Admin
                  </Link>
                )}
              </>
            )}
          </nav>
          
          {/* Auth Actions */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link to="/profile" className="text-sm px-3 py-2 rounded bg-gray-700 hover:bg-gray-600">
                  Profile
                </Link>
                <button 
                  onClick={logout}
                  className="text-sm px-3 py-2 rounded bg-red-700 hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <WalletConnect />
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <span className="block h-6 w-6">✕</span>
              ) : (
                <span className="block h-6 w-6">☰</span>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-2 pb-3 space-y-1">
            <Link to="/marketplace" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
              Marketplace
            </Link>
            <Link to="/supply-chain" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
              Supply Chain
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/transactions" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
                  Transactions
                </Link>
                <Link to="/profile" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
                  Profile
                </Link>
                {currentUser.role === 'seller' && (
                  <Link to="/seller-dashboard" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
                    Seller Dashboard
                  </Link>
                )}
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="block px-3 py-2 hover:bg-gray-700 hover:text-white">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 hover:bg-red-700 hover:text-white"
                >
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <div className="px-3 py-2">
                <WalletConnect />
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;