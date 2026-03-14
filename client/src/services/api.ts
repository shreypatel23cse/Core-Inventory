import axios from 'axios';

const API_BASE = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authApi = {
  login: (data: any) => api.post('/auth/login', data),
  signup: (data: any) => api.post('/auth/signup', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
};

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/api/dashboard/stats'),
};

// Products
export const productsApi = {
  list: () => api.get('/api/products'),
  create: (data: any) => api.post('/api/products', data),
  update: (id: string, data: any) => api.put(`/api/products/${id}`, data),
  delete: (id: string) => api.delete(`/api/products/${id}`),
};

// Warehouses
export const warehousesApi = {
  list: () => api.get('/api/warehouses'),
  create: (data: any) => api.post('/api/warehouses', data),
  update: (id: string, data: any) => api.put(`/api/warehouses/${id}`, data),
  delete: (id: string) => api.delete(`/api/warehouses/${id}`),
};

// Locations
export const locationsApi = {
  list: () => api.get('/api/locations'),
  create: (data: any) => api.post('/api/locations', data),
  delete: (id: string) => api.delete(`/api/locations/${id}`),
};

// Stock
export const stockApi = {
  list: () => api.get('/api/stock'),
  adjust: (data: any) => api.post('/api/stock/adjust', data),
};

// Receipts
export const receiptsApi = {
  list: () => api.get('/api/receipts'),
  create: (data: any) => api.post('/api/receipts', data),
  markReady: (id: string) => api.post(`/api/receipts/${id}/mark-ready`),
  validate: (id: string) => api.post(`/api/receipts/${id}/validate`),
  cancel: (id: string) => api.post(`/api/receipts/${id}/cancel`),
};

// Deliveries
export const deliveriesApi = {
  list: () => api.get('/api/deliveries'),
  create: (data: any) => api.post('/api/deliveries', data),
  validate: (id: string) => api.post(`/api/deliveries/${id}/validate`),
  cancel: (id: string) => api.post(`/api/deliveries/${id}/cancel`),
};

// Transfers
export const transfersApi = {
  create: (data: any) => api.post('/api/transfers', data),
};

// Moves
export const movesApi = {
  list: () => api.get('/api/moves'),
};

// Settings
export const settingsApi = {
  get: () => api.get('/api/settings'),
  update: (data: any) => api.post('/api/settings', data),
};

export default api;
