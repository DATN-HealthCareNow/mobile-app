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
  otp?: string;
}

export interface RegisterResponse {
  user_id: string;
  [key: string]: any;
}

export interface GoogleLoginRequest {
  id_token: string;
}

export interface OtpRequest {
  email: string;
  current_password?: string;
}

export interface ChangePasswordConfirmRequest {
  email: string;
  current_password?: string;
  otp: string;
  new_password?: string;
}

export interface ForgotPasswordConfirmRequest {
  email: string;
  otp: string;
  new_password?: string;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return axiosClient.post('/api/v1/auth/login', data);
  },

  requestRegisterOtp: async (data: OtpRequest): Promise<void> => {
    return axiosClient.post('/api/v1/auth/register/request-otp', data);
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    return axiosClient.post('/api/v1/auth/register', data);
  },

  googleLogin: async (data: GoogleLoginRequest): Promise<LoginResponse> => {
    return axiosClient.post('/api/v1/auth/google', data);
  },

  requestChangePasswordOtp: async (data: OtpRequest): Promise<void> => {
    return axiosClient.post('/api/v1/auth/change-password/request-otp', data);
  },

  confirmChangePassword: async (data: ChangePasswordConfirmRequest): Promise<void> => {
    return axiosClient.post('/api/v1/auth/change-password/confirm', data);
  },

  requestForgotPasswordOtp: async (data: OtpRequest): Promise<void> => {
    return axiosClient.post('/api/v1/auth/forgot-password/request-otp', data);
  },

  confirmForgotPassword: async (data: ForgotPasswordConfirmRequest): Promise<void> => {
    return axiosClient.post('/api/v1/auth/forgot-password/confirm', data);
  },

  // validate: async () => {
  //   return axiosClient.get('/api/v1/auth/validate');
  // }
};
