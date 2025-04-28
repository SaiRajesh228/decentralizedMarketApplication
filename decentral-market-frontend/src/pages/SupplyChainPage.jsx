import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import { useAuth } from '../hooks/useAuth';

const SupplyChainPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: ''
  });
  
  // Fetch components owned by user or search results
  useEffect(() => {
    const fetchComponents = async () => {
      setLoading(true);
      try {
        const { data } = await apiService.searchComponents({ 
          query: searchQuery
        });
        setComponents(data.components);
      } catch (error) {
        console.error('Error fetching components:', error);
        toast.error('Failed to load components');
      } finally {
        setLoading(false);
      }
    };
    
    fetchComponents();
  }, [searchQuery]);
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle component registration
  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      const { data } = await apiService.registerComponent(formData);
      setComponents([data.component, ...components]);
      setShowRegisterForm(false);
      setFormData({
        name: '',
        description: '',
        type: ''
      });
      toast.success('Component registered successfully');
    } catch (error) {
      console.error('Error registering component:', error);
      toast.error(error.response?.data?.message || 'Failed to register component');
    }
  };
  
  // Sample component types
  const componentTypes = [
    'Raw Material',
    'Part',
    'Assembly',
    'Finished Product',
    'Package'
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Supply Chain Tracking</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowRegisterForm(prev => !prev)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {showRegisterForm ? 'Cancel' : 'Register Component'}
          </button>
        )}
      </div>
      
      {/* Component Registration Form */}
      {showRegisterForm && (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Register New Component</h2>
          <form onSubmit={handleRegister}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Component Type*
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a type</option>
                  {componentTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Register Component
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Search Components */}
      <div className="mb-6">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Components
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, description, or ID"
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      {/* Components List */}
      {loading ? (
        <div className="text-center py-12">Loading components...</div>
      ) : components.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No components found. {isAuthenticated ? 'Register your first component above.' : 'Please login to register components.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Component
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
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
              {components.map(component => (
                <tr key={component.componentId}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {component.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {component.componentId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {component.type}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {component.owner === currentUser?.walletAddress 
                        ? 'You'
                        : `${component.owner.substring(0, 6)}...${component.owner.substring(component.owner.length - 4)}`
                      }
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      component.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {component.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      to={`/components/${component.componentId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Details
                    </Link>
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

export default SupplyChainPage;