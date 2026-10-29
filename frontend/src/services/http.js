import axios from 'axios';

const http = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/+$/, ''),
  timeout: 10000,
});
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('restaurant-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && error.config?.url !== '/auth/login' && localStorage.getItem('restaurant-token')) {
    localStorage.removeItem('restaurant-token');
    localStorage.removeItem('user-info');
    window.dispatchEvent(new Event('restaurant-session-expired'));
  }
  return Promise.reject(error);
});
export default http;
