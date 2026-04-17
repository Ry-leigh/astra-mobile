import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// const baseURL = 'http://127.0.0.1:8000/api';
const baseURL = 'https://astra-backend-jx2s.onrender.com/api';

const client = axios.create({
  baseURL: baseURL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const { useAuthStore } = require('../store/authStore');
  const token = useAuthStore.getState().token;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      const { useAuthStore } = require('../store/authStore');
      
      await SecureStore.deleteItemAsync('userToken');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default client;