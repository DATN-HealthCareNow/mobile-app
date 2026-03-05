import { axiosClient } from '../axiosClient';

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user_id: string;
  [key: string]: any; // Phụ thuộc vào dữ liệu trả về thực tế từ Auth Controller
}

export interface RegisterRequest {
  email?: string;
  phone?: string;
  password?: string;
  full_name?: string;
}

export interface RegisterResponse {
  user_id: string;
  [key: string]: any;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post('/api/v1/auth/login', data);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return axiosClient.post('/api/v1/auth/register', data);
  },

  // validate: async () => {
  //   return axiosClient.get('/api/v1/auth/validate');
  // }
};
