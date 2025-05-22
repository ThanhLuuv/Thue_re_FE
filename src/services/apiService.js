import axios from 'axios';

const API_BASE_URL = `https://thue-app-backend.onrender.com/api`;

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

const apiService = {
  register: async (data) => {
    try {
      return await axiosInstance.post('/auth/register', data);
    } catch (error) {
      console.error('Error in register:', error);
      throw error;
    }
  },

  verifyEmail: async (data) => {
    try {
      return await axiosInstance.post('/auth/verify-email', data);
    } catch (error) {
      console.error('Error in verifyEmail:', error);
      throw error;  
    }
  },

  // Login
  login: async (credentials) => {
    try {
      return await axiosInstance.post('/auth/login', credentials);
    } catch (error) {
      console.error('Error in login:', error);
      throw error;
    }
  },

  // Create new item
  createItem: async (data) => {
    try {
      const token = localStorage.getItem('token');
      return await axiosInstance.post('/item', 
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Get all items
  getAllItems: async () => {
    try {
      return await axiosInstance.get('/item');
    } catch (error) {
      console.error('Error fetching all items:', error);
      throw error;
    }
  },

  // Get items by account
  getItemsByAccount: async () => {
    try {
      return await axiosInstance.get('/item/account');
    } catch (error) {
      console.error('Error fetching account items:', error);
      throw error;
    }
  },

  // Get item by ID
  getItemById: async (itemId) => {
    try {
      return await axiosInstance.get(`/item/${itemId}`);
    } catch (error) {
      console.error('Error fetching item details:', error);
      throw error;
    }
  },

  // Update item
  updateItem: async (itemId, itemData, availability = [], images = [], locations = []) => {
    try {
      return await axiosInstance.put(`/item/${itemId}`, { itemData, availability, images, locations });
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Get available items with search and filters
  getAvailableItems: async (searchQuery = '', location = '', category = '', page = 1, lowprice = '', highprice = '') => {
    try {
      console.log('Request params:', { searchQuery, location, category, page, lowprice, highprice });
      
      const params = {
        page: page.toString(),
        limit: '24'
      };

      if (searchQuery) params.search = searchQuery;
      if (location) params.province = location;
      if (category) params.category = category;
      if (lowprice) params.lowprice = lowprice;
      if (highprice) params.highprice = highprice;

      const response = await axiosInstance.get('/item/available', { params });
      console.log('API Response:', response);

      return {
        success: true,
        data: response.data || [],
        pagination: {
          currentPage: response.pagination?.currentPage || page,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
        },
      };
    } catch (error) {
      console.error('Error fetching available items:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch items',
        data: [],
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: 0,
        },
      };
    }
  },

  // Delete item
  deleteItem: async (itemId) => {
    try {
      return await axiosInstance.delete(`/item/${itemId}`);
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  get24LastestItems: async (page = 1, limit = 24) => {
    try {
      console.log('Fetching latest items');
      
      const response = await axiosInstance.get('/item/latest-24', {
        params: { page, limit }
      });
      
      console.log('API Response:', response);

      return {
        success: true,
        data: response.data || [],
        pagination: {
          currentPage: response.pagination?.currentPage || page,
          totalPages: response.pagination?.totalPages || 1,
          totalItems: response.pagination?.totalItems || 0,
        },
      };
    } catch (error) {
      console.error('Error in get24LastestItems:', error);
      if (error.message.includes('NetworkError') || error.message.includes('timeout')) {
        return {
          success: false,
          error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và đảm bảo máy chủ đang chạy.',
          data: []
        };
      }
      return {
        success: false,
        error: error.message || 'Failed to fetch items',
        data: []
      };
    }
  },
  forgotPassword: async ({email}) => {
    try {
      return await axiosInstance.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw error;
    }
  },
  verifyResetPassword: async (data) => {
    try {
      return await axiosInstance.post('/auth/verify-code', data);
    } catch (error) {
      console.error('Error in verifyResetPassword:', error);
      throw error;
    }
  },
  resetPassword: async (data) => {
    try {
      return await axiosInstance.post('/auth/reset-password', data);
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw error;  
    }
  },
  getCategories: async () => {
    try {
      const response = await axiosInstance.get('/categories');
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.response?.data || error.message,
        data: []
      };
    }
  }
};

export default apiService; 