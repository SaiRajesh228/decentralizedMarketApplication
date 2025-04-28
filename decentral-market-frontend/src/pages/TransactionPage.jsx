import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const TransactionsPage = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState('all');
  
  // Fetch user's transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.getUserTransactions(
          currentUser.walletAddress,
          transactionType
        );
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser.walletAddress, transactionType]);
  
  // Handle delivery confirmation
  const handleConfirmDelivery = async (transactionId) => {
    try {
      await apiService.confirmDelivery(transactionId);
      
      // Update transaction status in state
      setTransactions(transactions.map(transaction => 
        transaction.transactionId === transactionId 
          ? { ...transaction, status: 'delivered', deliveryDate: new Date() }
          : transaction
      ));
      
      toast.success('Delivery confirmed successfully');
    } catch (error) {
      console.error('Error confirming delivery:', error);
      toast.error(error.response?.data?.message || 'Failed to confirm delivery');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Your Transactions</h1>
      
      {/* Transaction Type Filter */}
      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setTransactionType('all')}
            className={`px-4 py-2 rounded ${
              transactionType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTransactionType('purchases')}
            className={`px-4 py-2 rounded ${
              transactionType === 'purchases' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => setTransactionType('sales')}
            className={`px-4 py-2 rounded ${
              transactionType === 'sales' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            Sales
          </button>
        </div>
      </div>
      
      {/* Transactions List */}
      {loading ? (
        <div className="text-center py-12">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No transactions found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.transactionId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={transaction.product?.ipfsHash 
                            ? `${process.env.REACT_APP_IPFS_GATEWAY}/${transaction.product.ipfsHash}`
                            : '/placeholder-product.jpg'
                          }
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product?.name || 'Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {transaction.productId}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${parseFloat(transaction.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(transaction.purchaseDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      transaction.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status === 'delivered' ? 'Delivered' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/transactions/${transaction.transactionId}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Details
                    </Link>
                    
                    {/* Show confirm button only to seller for pending transactions */}
                    {currentUser.walletAddress === transaction.seller && 
                     transaction.status === 'paid' && (
                      <button
                        onClick={() => handleConfirmDelivery(transaction.transactionId)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Confirm Delivery
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
  );
};

export default TransactionsPage;