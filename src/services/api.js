import axios from 'axios';

// Use environment variable for API URL
// For production on Render, use the Render URL
// For development, use localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://school-backend-community-development.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for Render free tier cold start
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    if (config.data && config.method !== 'get') {
      console.log('Request Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Log response for debugging
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle different error statuses
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      console.error(`❌ API Error ${status}:`, data);
      
      switch (status) {
        case 400:
          console.error('Bad Request:', data);
          break;
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('Unauthorized! Redirecting to login...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          console.error('Forbidden: You do not have permission to access this resource');
          break;
        case 404:
          console.error('Not Found: The requested resource does not exist');
          break;
        case 500:
          console.error('Internal Server Error: Please try again later');
          break;
        default:
          console.error(`Unhandled error status: ${status}`);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response from server', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper methods for common operations
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export default api;