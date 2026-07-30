import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data)
};

export const inventoryAPI = {
  getProducts: () => api.get('/api/inventory/products'),
  getProduct: (id) => api.get(`/api/inventory/products/${id}`),
  checkStock: (id, quantity) => api.get(`/api/inventory/check/${id}`, { params: { quantity } })
};

export const orderAPI = {
  createOrder: (data) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  cancelOrder: (id) => api.put(`/api/orders/${id}/cancel`)
};

export const notificationAPI = {
  getMyNotifications: () => api.get('/api/notifications/my-notifications')
};

export default api;
