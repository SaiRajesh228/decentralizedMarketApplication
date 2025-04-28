import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  // Format price to 2 decimal places
  const formattedPrice = parseFloat(product.price).toFixed(2);
  
  // Generate IPFS image URL if available
  const imageUrl = product.ipfsHash 
    ? `${process.env.REACT_APP_IPFS_GATEWAY}/${product.ipfsHash}`
    : '/placeholder-product.jpg';
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">${formattedPrice}</span>
          
          <Link 
            to={`/products/${product.productId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            View Details
          </Link>
        </div>
        
        <div className="mt-3 text-xs text-gray-500">
          <span>Category: {product.category}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;