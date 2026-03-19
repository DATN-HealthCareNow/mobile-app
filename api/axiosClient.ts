import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { notifySessionChange } from '../utils/sessionEvents';

// Lấy API_URL từ biến môi trường của Expo, fallback về localhost nếu chưa set
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost';

export const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: đính kèm token vào header
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // Giả sử ta lưu token đăng nhập trong SecureStore với key 'accessToken'
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Hoặc set 'x-user-id' tùy thuộc vào logic Auth mới
      }
    } catch (error) {
      console.error('Error getting token from secure store', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: xử lý chung các lỗi trả về
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về thẳng data để gọi api cho ngắn gọn
    return response.data;
  },
  async (error: AxiosError) => {
    // Xử lý các lỗi common như 401 Unauthorized (hết hạn token)
    if (error.response?.status === 401) {
      console.log('Token expired or unauthorized');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userId');
      notifySessionChange();
    }
    return Promise.reject(error);
  }
);
