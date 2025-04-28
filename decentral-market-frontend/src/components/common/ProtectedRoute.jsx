import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Component to protect routes that require authentication or specific roles
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, isAuthenticated, loading } = useAuth();
  
  // If auth is still loading, show loading state
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // If not authenticated, redirect to home page
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // If role requirement specified, check if user has required role
  if (requiredRole && currentUser.role !== requiredRole) {
    // If user doesn't have the required role, redirect to home page
    return <Navigate to="/" />;
  }
  
  // If all checks pass, render the protected component
  return children;
};

export default ProtectedRoute;