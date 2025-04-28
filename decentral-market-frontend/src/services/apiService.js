import axios from 'axios';

// Create an axios instance with default config
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include the auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors by redirecting to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Optional: redirect to login or show notification
    }
    return Promise.reject(error);
  }
);

// Auth related API calls
const authService = {
  register: (userData) => apiClient.post('/auth/register', userData),
  getNonce: (walletAddress) => apiClient.get(`/auth/nonce/${walletAddress}`),
  login: (loginData) => apiClient.post('/auth/login', loginData),
  getProfile: () => apiClient.get('/auth/profile'),
  requestSeller: () => apiClient.post('/auth/request-seller')
};

// Product related API calls
const productService = {
  getProducts: (params) => apiClient.get('/products', { params }),
  getProduct: (id) => apiClient.get(`/products/${id}`),
  getSellerProducts: (walletAddress) => apiClient.get(`/products/seller/${walletAddress}`),
  createProduct: (productData) => apiClient.post('/products', productData),
  markUnavailable: (productId) => apiClient.put(`/products/${productId}/unavailable`)
};

// Transaction related API calls
const transactionService = {
  buyProduct: (productId) => apiClient.post('/transactions/buy', { productId }),
  getTransaction: (id) => apiClient.get(`/transactions/${id}`),
  getUserTransactions: (walletAddress, type) => apiClient.get(`/transactions/user/${walletAddress}`, { params: { type } }),
  confirmDelivery: (transactionId) => apiClient.put(`/transactions/${transactionId}/confirm`)
};

// Supply chain related API calls
const supplyChainService = {
  getComponent: (id) => apiClient.get(`/supply-chain/components/${id}`),
  getComponentHistory: (id) => apiClient.get(`/supply-chain/components/${id}/history`),
  searchComponents: (params) => apiClient.get('/supply-chain/components/search', { params }),
  registerComponent: (componentData) => apiClient.post('/supply-chain/components', componentData),
  addTrackingEvent: (componentId, eventData) => apiClient.post(`/supply-chain/components/${componentId}/events`, eventData),
  transferOwnership: (componentId, newOwner) => apiClient.put(`/supply-chain/components/${componentId}/transfer`, { newOwner })
};

// Admin related API calls
const adminService = {
  getAllUsers: () => apiClient.get('/admin/users'),
  getPendingSellerRequests: () => apiClient.get('/admin/seller-requests'),
  handleSellerRequest: (walletAddress, approve, reason) => apiClient.put(`/admin/users/${walletAddress}/approve-seller`, { approve, reason }),
  revokeSeller: (walletAddress, reason) => apiClient.put(`/admin/users/${walletAddress}/revoke-seller`, { reason }),
  getMarketplaceStats: () => apiClient.get('/admin/stats'),
  setAdminStatus: (walletAddress, isAdmin) => apiClient.put(`/admin/users/${walletAddress}/admin-status`, { isAdmin })
};

// Export all services
export default {
  ...authService,
  ...productService,
  ...transactionService,
  ...supplyChainService,
  ...adminService,
  get: apiClient.get,
  post: apiClient.post,
  put: apiClient.put,
  delete: apiClient.delete
};