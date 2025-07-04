import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network error. Please check your connection.';
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (userData) => api.put('/auth/profile', userData),
  
  // Change password
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  
  // Refresh token
  refreshToken: () => api.post('/auth/refresh'),
  
  // Logout (if backend tracks sessions)
  logout: () => api.post('/auth/logout'),
};

// Products API endpoints
export const productsAPI = {
  // Get all products with optional filters
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        if (Array.isArray(params[key])) {
          params[key].forEach(value => queryParams.append(key, value));
        } else {
          queryParams.append(key, params[key]);
        }
      }
    });
    
    return api.get(`/products?${queryParams.toString()}`);
  },
  
  // Get single product by ID
  getProduct: (id) => api.get(`/products/${id}`),
  
  // Get featured products
  getFeatured: () => api.get('/products/featured'),
  
  // Get trending products
  getTrending: () => api.get('/products/trending'),
  
  // Get similar products
  getSimilar: (id) => api.get(`/products/${id}/similar`),
  
  // Search products
  search: (query, params = {}) => {
    const searchParams = new URLSearchParams({ q: query, ...params });
    return api.get(`/products/search?${searchParams.toString()}`);
  },
  
  // Get product categories
  getCategories: () => api.get('/products/categories'),
  
  // Get products by category
  getByCategory: (category, params = {}) => {
    const queryParams = new URLSearchParams({ category, ...params });
    return api.get(`/products?${queryParams.toString()}`);
  },
};

// Users API endpoints
export const usersAPI = {
  // Get user profile with interaction history
  getProfile: () => api.get('/users/profile'),
  
  // Update user preferences
  updatePreferences: (preferences) => api.put('/users/preferences', preferences),
  
  // Get liked products
  getLikedProducts: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/users/liked-products?${queryParams.toString()}`);
  },
  
  // Get purchase history
  getPurchaseHistory: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/users/purchase-history?${queryParams.toString()}`);
  },
  
  // Get search history
  getSearchHistory: () => api.get('/users/search-history'),
  
  // Clear search history
  clearSearchHistory: () => api.delete('/users/search-history'),
  
  // Get interaction statistics
  getInteractionStats: () => api.get('/users/interaction-stats'),
  
  // Record user interaction
  recordInteraction: (interactionData) => api.post('/users/interaction', interactionData),
};

// Recommendations API endpoints
export const recommendationsAPI = {
  // Get personalized recommendations
  getPersonalized: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/recommendations/personalized?${queryParams.toString()}`);
  },
  
  // Get collaborative filtering recommendations
  getCollaborative: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/recommendations/collaborative?${queryParams.toString()}`);
  },
  
  // Get content-based recommendations
  getContentBased: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/recommendations/content-based?${queryParams.toString()}`);
  },
  
  // Get trending recommendations
  getTrending: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/recommendations/trending?${queryParams.toString()}`);
  },
  
  // Get category-based recommendations
  getByCategory: (category, params = {}) => {
    const queryParams = new URLSearchParams({ category, ...params });
    return api.get(`/recommendations/category?${queryParams.toString()}`);
  },
  
  // Get recommendation statistics
  getStats: () => api.get('/recommendations/stats'),
  
  // Provide feedback on recommendations
  provideFeedback: (feedbackData) => api.post('/recommendations/feedback', feedbackData),
};

// Cart API endpoints (if backend manages cart)
export const cartAPI = {
  // Get user's cart
  getCart: () => api.get('/cart'),
  
  // Add item to cart
  addItem: (itemData) => api.post('/cart/items', itemData),
  
  // Update item quantity
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  
  // Remove item from cart
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
  
  // Clear entire cart
  clearCart: () => api.delete('/cart'),
  
  // Apply promo code
  applyPromo: (promoCode) => api.post('/cart/promo', { code: promoCode }),
  
  // Remove promo code
  removePromo: () => api.delete('/cart/promo'),
};

// Orders API endpoints
export const ordersAPI = {
  // Create new order
  createOrder: (orderData) => api.post('/orders', orderData),
  
  // Get user's orders
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return api.get(`/orders?${queryParams.toString()}`);
  },
  
  // Get single order
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  
  // Update order status (admin only)
  updateOrderStatus: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  
  // Cancel order
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
};

// Analytics API endpoints
export const analyticsAPI = {
  // Get user analytics
  getUserAnalytics: () => api.get('/analytics/user'),
  
  // Get product analytics
  getProductAnalytics: (productId) => api.get(`/analytics/products/${productId}`),
  
  // Get recommendation performance
  getRecommendationAnalytics: () => api.get('/analytics/recommendations'),
  
  // Track page view
  trackPageView: (pageData) => api.post('/analytics/page-view', pageData),
  
  // Track custom event
  trackEvent: (eventData) => api.post('/analytics/event', eventData),
};

// Utility functions
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return data.message || 'Bad request. Please check your input.';
        case 401:
          return 'Authentication required. Please log in.';
        case 403:
          return 'Access denied. You don\'t have permission for this action.';
        case 404:
          return 'Resource not found.';
        case 409:
          return data.message || 'Conflict. Resource already exists.';
        case 422:
          return data.message || 'Validation error. Please check your input.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return data.message || 'An unexpected error occurred.';
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.';
    }
  },
  
  // Format query parameters
  formatParams: (params) => {
    const formatted = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          formatted[key] = value.join(',');
        } else {
          formatted[key] = value;
        }
      }
    });
    
    return formatted;
  },
  
  // Create cancel token for request cancellation
  createCancelToken: () => axios.CancelToken.source(),
  
  // Check if error is due to request cancellation
  isCancel: (error) => axios.isCancel(error),
  
  // Upload file with progress tracking
  uploadFile: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },
};

// Export default api instance
export default api;

// Export all API modules
export {
  authAPI as auth,
  productsAPI as products,
  usersAPI as users,
  recommendationsAPI as recommendations,
  cartAPI as cart,
  ordersAPI as orders,
  analyticsAPI as analytics,
};

// Health check endpoint
export const healthCheck = () => api.get('/health');

// API configuration
export const config = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// Request retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config: originalRequest } = error;
    
    if (
      error.response?.status >= 500 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest._retryCount < config.retryAttempts
    ) {
      originalRequest._retry = true;
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      
      // Wait before retrying
      await new Promise(resolve => 
        setTimeout(resolve, config.retryDelay * originalRequest._retryCount)
      );
      
      return api(originalRequest);
    }
    
    return Promise.reject(error);
  }
);