import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

// Create the auth context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check if token exists and is valid on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          // Check token expiration
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            logout();
          } else {
            // Valid token, get user profile
            const response = await apiService.get('/auth/profile');
            setCurrentUser(response.data.user);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  // Login with wallet
  const loginWithWallet = async (walletAddress, signature) => {
    try {
      const response = await apiService.post('/auth/login', {
        walletAddress,
        signature
      });
      
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      setToken(token);
      setCurrentUser(user);
      
      toast.success('Login successful');
      return user;
    } catch (error) {
      console.error('Login failed:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      throw error;
    }
  };

  // Register user
  const registerUser = async (walletAddress, name) => {
    try {
      const response = await apiService.post('/auth/register', {
        walletAddress,
        name
      });
      
      toast.success('Registration successful');
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      throw error;
    }
  };

  // Request seller status
  const requestSellerStatus = async () => {
    try {
      const response = await apiService.post('/auth/request-seller');
      setCurrentUser({
        ...currentUser,
        sellerRequest: { status: 'pending', date: new Date() }
      });
      toast.success('Seller status requested');
      return response.data;
    } catch (error) {
      console.error('Seller request failed:', error);
      toast.error(error.response?.data?.message || 'Seller request failed');
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    navigate('/');
  };

  // Context value
  const value = {
    currentUser,
    loading,
    isAuthenticated: !!currentUser,
    loginWithWallet,
    registerUser,
    requestSellerStatus,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};