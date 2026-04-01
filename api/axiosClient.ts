import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { notifySessionChange } from '../utils/sessionEvents';

const ensureHttpPrefix = (url: string) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `http://${url}`;
};

const resolveHostApiUrl = () => {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ||
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra?.expoClient?.hostUri;

  const host = hostUri?.split(':')[0];
  if (!host) {
    return null;
  }

  return `http://${host}:80`;
};

const envApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim()
  ? ensureHttpPrefix(process.env.EXPO_PUBLIC_API_URL.trim())
  : null;

const hostApiUrl = resolveHostApiUrl();
const API_URL = envApiUrl || hostApiUrl || undefined;
const API_FALLBACK_URL = hostApiUrl && hostApiUrl !== API_URL ? hostApiUrl : null;

export const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  console.log(`[axiosClient] Using API base URL: ${API_URL || 'NOT_CONFIGURED'}`);
  if (API_FALLBACK_URL) {
    console.log(`[axiosClient] Network fallback URL: ${API_FALLBACK_URL}`);
  }
}

// Request Interceptor: đính kèm token vào header
axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      if (!API_URL) {
        throw new Error('API base URL is not configured. Set EXPO_PUBLIC_API_URL in .env or run app with Expo host LAN.');
      }

      // Giả sử ta lưu token đăng nhập trong SecureStore với key 'accessToken'
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
      }
      
      const userId = await SecureStore.getItemAsync('userId');
      if (userId) {
        config.headers['x-user-id'] = userId;
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
    const requestConfig = error.config as (InternalAxiosRequestConfig & { _retryWithFallback?: boolean }) | undefined;

    if (
      error.code === 'ERR_NETWORK' &&
      API_FALLBACK_URL &&
      requestConfig &&
      !requestConfig._retryWithFallback
    ) {
      requestConfig._retryWithFallback = true;
      requestConfig.baseURL = API_FALLBACK_URL;

      if (__DEV__) {
        console.log(`[axiosClient] Retrying request with fallback URL: ${API_FALLBACK_URL}`);
      }

      return axiosClient.request(requestConfig);
    }

    // Xử lý các lỗi common như 401 Unauthorized (hết hạn token)
    if (error.response?.status === 401) {
      console.log('Token expired or unauthorized');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userId');
      notifySessionChange();
    }

    if (__DEV__) {
      console.log(
        `[axiosClient] Request failed: ${requestConfig?.method?.toUpperCase() || 'UNKNOWN'} ${requestConfig?.baseURL || ''}${requestConfig?.url || ''}`,
      );
      console.log(`[axiosClient] Axios error code: ${error.code || 'UNKNOWN'}`);
      console.log(`[axiosClient] HTTP Status: ${error.response?.status || 'NO_STATUS'}`);
      if (error.response?.data) {
        console.log(`[axiosClient] Response data:`, error.response.data);
      }
      if (error.response?.status === 401) {
        console.warn(`[axiosClient] ⚠️ 401 Unauthorized - Token may be expired or invalid. Clearing storage.`);
      }
      if (error.response?.status === 500) {
        console.error(`[axiosClient] ❌ 500 Server Error - Backend service returned error.`);
      }
    }

    return Promise.reject(error);
  }
);
