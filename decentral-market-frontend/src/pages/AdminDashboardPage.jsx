import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  
  // Fetch admin data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'dashboard') {
          const { data } = await apiService.getMarketplaceStats();
          setStats(data);
        } else if (activeTab === 'sellerRequests') {
          const { data } = await apiService.getPendingSellerRequests();
          setPendingRequests(data.pendingRequests);
        } else if (activeTab === 'users') {
          const { data } = await apiService.getAllUsers();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab]);
  
  // Handle seller request approval/rejection
  const handleSellerRequest = async (walletAddress, approve, reason = '') => {
    try {
      await apiService.handleSellerRequest(walletAddress, approve, reason);
      
      // Update the requests list
      setPendingRequests(
        pendingRequests.filter(user => user.walletAddress !== walletAddress)
      );
      
      toast.success(`Seller request ${approve ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error handling seller request:', error);
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };
  
  // Handle revoking seller status
  const handleRevokeSeller = async (walletAddress, reason = '') => {
    try {
      await apiService.revokeSeller(walletAddress, reason);
      
      // Update the users list
      setUsers(users.map(user => 
        user.walletAddress === walletAddress 
          ? { ...user, role: 'buyer' }
          : user
      ));
      
      toast.success('Seller status revoked successfully');
    } catch (error) {
      console.error('Error revoking seller status:', error);
      toast.error(error.response?.data?.message || 'Failed to revoke seller status');
    }
  };
  
  // Handle setting admin status
  const handleSetAdminStatus = async (walletAddress, isAdmin) => {
    try {
      await apiService.setAdminStatus(walletAddress, isAdmin);
      
      // Update the users list
      setUsers(users.map(user => 
        user.walletAddress === walletAddress 
          ? { ...user, role: isAdmin ? 'admin' : 'buyer' }
          : user
      ));
      
      toast.success(`Admin status ${isAdmin ? 'granted' : 'revoked'} successfully`);
    } catch (error) {
      console.error('Error setting admin status:', error);
      toast.error(error.response?.data?.message || 'Failed to update admin status');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Admin Tabs */}
      <div className="mb-6 border-b">
        <div className="flex flex-wrap -mb-px">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('sellerRequests')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sellerRequests'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Seller Requests
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
        </div>
      </div>
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">Loading data...</div>
      )}
      
      {/* Dashboard Tab Content */}
      {!loading && activeTab === 'dashboard' && stats && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* User Stats */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-3">User Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Total Users</p>
                  <p className="text-xl font-bold">{stats.users.total}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Buyers</p>
                  <p className="text-xl font-bold">{stats.users.buyers}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Sellers</p>
                  <p className="text-xl font-bold">{stats.users.sellers}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Admins</p>
                  <p className="text-xl font-bold">{stats.users.admins}</p>
                </div>
              </div>
            </div>
            
            {/* Product Stats */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-3">Product Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-xl font-bold">{stats.products.total}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-xl font-bold">{stats.products.available}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Sold</p>
                  <p className="text-xl font-bold">{stats.products.sold}</p>
                </div>
              </div>
            </div>
            
            {/* Transaction Stats */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800 mb-3">Transaction Statistics</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Total Transactions</p>
                  <p className="text-xl font-bold">{stats.transactions.total}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Pending Delivery</p>
                  <p className="text-xl font-bold">{stats.transactions.pending}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-xl font-bold">{stats.transactions.completed}</p>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <p className="text-sm text-gray-500">Volume (USD)</p>
                  <p className="text-xl font-bold">${stats.transactions.volume?.toFixed(2) || 0}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Transaction Volume</h2>
            <div className="bg-white p-4 rounded-lg border">
              <p className="text-center text-gray-500">
                Transaction volume chart would go here (using Recharts library)
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Seller Requests Tab Content */}
      {!loading && activeTab === 'sellerRequests' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Pending Seller Requests</h2>
          
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No pending seller requests to review.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Request Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map(user => (
                    <tr key={user.walletAddress}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.walletAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.sellerRequest.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleSellerRequest(user.walletAddress, true)}
                          className="text-green-600 hover:text-green-900 mr-4"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt('Enter reason for rejection:');
                            if (reason !== null) {
                              handleSellerRequest(user.walletAddress, false, reason);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* User Management Tab Content */}
      {!loading && activeTab === 'users' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          {users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.walletAddress}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.walletAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'seller'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(user.registrationDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === 'seller' ? (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter reason for revoking seller status:');
                              if (reason !== null) {
                                handleRevokeSeller(user.walletAddress, reason);
                              }
                            }}
                            className="text-red-600 hover:text-red-900 mr-4"
                          >
                            Revoke Seller
                          </button>
                        ) : user.role === 'buyer' ? (
                          <button
                            onClick={() => handleSellerRequest(user.walletAddress, true)}
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Make Seller
                          </button>
                        ) : null}
                        
                        {user.role !== 'admin' ? (
                          <button
                            onClick={() => handleSetAdminStatus(user.walletAddress, true)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Make Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSetAdminStatus(user.walletAddress, false)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            Revoke Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;