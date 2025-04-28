import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import ProfilePage from './pages/ProfilePage';
import ProductDetailPage from './pages/ProductDetailPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import SupplyChainPage from './pages/SupplyChainPage';
import ComponentDetailPage from './pages/ComponentDetailPage';
import TransactionsPage from './pages/TransactionsPage';
import ProtectedRoute from './components/common/ProtectedRoute';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Public Routes */}
        <Route index element={<HomePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="supply-chain" element={<SupplyChainPage />} />
        <Route path="components/:componentId" element={<ComponentDetailPage />} />
        
        {/* Protected Routes - Any User */}
        <Route path="profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="transactions" element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } />
        
        {/* Seller Routes */}
        <Route path="seller-dashboard" element={
          <ProtectedRoute requiredRole="seller">
            <SellerDashboardPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
}

export default App;