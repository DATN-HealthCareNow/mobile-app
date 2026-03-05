import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { authService, LoginRequest, RegisterRequest } from '../api/services/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (data) => {
      // Lưu token vào Store nếu trả về token
      if (data.token) {
        await SecureStore.setItemAsync('accessToken', data.token);
      }
      if (data.user_id) {
        await SecureStore.setItemAsync('userId', data.user_id);
      }
      console.log('Login success', data);
    },
    onError: (error) => {
      console.error('Login failed', error);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      console.log('Register success', data);
    },
    onError: (error) => {
      console.error('Register failed', error);
    },
  });
};

export const useLogout = () => {
  return async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userId');
    console.log('Logged out');
  };
};
