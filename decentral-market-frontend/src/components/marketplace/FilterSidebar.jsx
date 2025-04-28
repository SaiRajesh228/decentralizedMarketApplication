import React, { useState, useEffect } from 'react';

const FilterSidebar = ({ onFilterChange, currentFilters }) => {
  // Local state for form inputs
  const [filters, setFilters] = useState({
    category: currentFilters.category || '',
    minPrice: currentFilters.minPrice || '',
    maxPrice: currentFilters.maxPrice || ''
  });
  
  // Sample categories - in a real app, fetch these from the API
  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Collectibles',
    'Art',
    'Digital Assets'
  ];
  
  // Update local state when current filters change
  useEffect(() => {
    setFilters({
      category: currentFilters.category || '',
      minPrice: currentFilters.minPrice || '',
      maxPrice: currentFilters.maxPrice || ''
    });
  }, [currentFilters]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Apply filters
  const applyFilters = (e) => {
    e.preventDefault();
    onFilterChange(filters);
  };
  
  // Reset filters
  const resetFilters = () => {
    const resetValues = {
      category: '',
      minPrice: '',
      maxPrice: ''
    };
    
    setFilters(resetValues);
    onFilterChange(resetValues);
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <form onSubmit={applyFilters}>
        {/* Category Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={filters.category}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        
        {/* Price Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleChange}
              placeholder="Min"
              className="w-1/2 p-2 border rounded"
            />
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleChange}
              placeholder="Max"
              className="w-1/2 p-2 border rounded"
            />
          </div>
        </div>
        
        {/* Filter Buttons */}
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-1/2"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 w-1/2"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default FilterSidebar;