import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const ProductDetailPage = () => {
  const { productId } = useParams();
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.getProduct(productId);
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId]);
  
  // Handle product purchase
  const handlePurchase = async () => {
    if (!isAuthenticated) {
      toast.warning('Please connect your wallet first');
      return;
    }
    
    if (product.seller === currentUser.walletAddress) {
      toast.warning('You cannot buy your own product');
      return;
    }
    
    setProcessing(true);
    try {
      const { data } = await apiService.buyProduct(product.productId);
      toast.success('Purchase successful!');
      navigate(`/transactions/${data.transaction.transactionId}`);
    } catch (error) {
      console.error('Purchase failed:', error);
      toast.error(error.response?.data?.message || 'Purchase failed');
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return <div className="flex justify-center py-12">Loading product...</div>;
  }
  
  if (!product) {
    return <div className="text-center py-12 text-gray-500">Product not found</div>;
  }
  
  // Generate IPFS image URL if available
  const imageUrl = product.ipfsHash 
    ? `${process.env.REACT_APP_IPFS_GATEWAY}/${product.ipfsHash}`
    : '/placeholder-product.jpg';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={imageUrl} 
            alt={product.name}
            className="w-full h-auto rounded-lg"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          <div className="mb-4">
            <span className="text-2xl font-bold text-green-600">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Details</h2>
            <ul className="text-gray-700">
              <li><span className="font-medium">Category:</span> {product.category}</li>
              <li><span className="font-medium">Seller:</span> {product.seller}</li>
              <li>
                <span className="font-medium">Listed:</span> {new Date(product.createdAt).toLocaleDateString()}
              </li>
              <li>
                <span className="font-medium">Product ID:</span> {product.productId}
              </li>
            </ul>
          </div>
          
          {/* Buy Button */}
          {product.isAvailable ? (
            <button
              onClick={handlePurchase}
              disabled={processing || !isAuthenticated}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {processing ? 'Processing...' : 'Buy Now'}
            </button>
          ) : (
            <button disabled className="w-full py-3 bg-gray-400 text-white rounded-lg">
              Sold Out
            </button>
          )}
          
          {!isAuthenticated && (
            <p className="text-sm text-center mt-2 text-gray-500">
              Connect your wallet to make a purchase
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;