import axios from 'axios';

// Base API URL - adjust based on your environment
const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for GPT requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token if needed
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

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Service functions
export const apiService = {
  // Health check
  async healthCheck() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  // Call Andreea GPT
  async callAndreeaGPT(prompt, language = 'English') {
    try {
      const response = await apiClient.post('/andreea/gpt', {
        prompt,
        language
      });
      return response.data;
    } catch (error) {
      console.error('GPT API Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Profit API endpoints
  async getProfitOverview() {
    const response = await apiClient.get('/profit/overview');
    return response.data;
  },

  async getProfitAds() {
    const response = await apiClient.get('/profit/profit-ads');
    return response.data;
  },

  async getFraudReturns() {
    const response = await apiClient.get('/profit/fraud-returns');
    return response.data;
  },

  // Supplier Optimizer API endpoints
  async getSupplierForecast() {
    const response = await apiClient.get('/supplier-optimizer/forecast');
    return response.data;
  },

  async getStockSuppliers() {
    const response = await apiClient.get('/supplier-optimizer/stock-suppliers');
    return response.data;
  }
};

export default apiService;
