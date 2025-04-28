import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';
import ProductForm from '../components/marketplace/ProductForm';

const SellerDashboardPage = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Fetch seller's products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.getSellerProducts(currentUser.walletAddress);
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load your products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [currentUser.walletAddress]);
  
  // Handle product creation
  const handleCreateProduct = async (productData) => {
    try {
      const { data } = await apiService.createProduct(productData);
      setProducts([data.product, ...products]);
      setShowForm(false);
      toast.success('Product listed successfully');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to list product');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Seller Dashboard</h1>
        <button
          onClick={() => setShowForm(prev => !prev)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {showForm ? 'Cancel' : 'List New Product'}
        </button>
      </div>
      
      {/* New Product Form */}
      {showForm && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">List a New Product</h2>
          <ProductForm onSubmit={handleCreateProduct} />
        </div>
      )}
      
      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Products</h3>
          <p className="text-2xl font-bold">{products.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Available</h3>
          <p className="text-2xl font-bold">
            {products.filter(p => p.isAvailable).length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Sold</h3>
          <p className="text-2xl font-bold">
            {products.filter(p => !p.isAvailable).length}
          </p>
        </div>
      </div>
      
      {/* Products Table */}
      <h2 className="text-xl font-semibold mb-4">Your Products</h2>
      
      {loading ? (
        <div className="text-center py-12">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          You haven't listed any products yet.
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
                  Listed Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img 
                          className="h-10 w-10 rounded-full object-cover" 
                          src={product.ipfsHash 
                            ? `${process.env.REACT_APP_IPFS_GATEWAY}/${product.ipfsHash}`
                            : '/placeholder-product.jpg'
                          }
                          alt="" 
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${parseFloat(product.price).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.isAvailable ? 'Available' : 'Sold'}
                    </span>
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

export default SellerDashboardPage;