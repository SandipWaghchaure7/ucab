import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Auto attach driver token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('driver_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('driver_token');
      localStorage.removeItem('driver_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;