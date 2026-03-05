import { axiosClient } from '../axiosClient';

export interface UserProfileResponse {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  [key: string]: any;
}

export interface UpdateProfileRequest {
  full_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  height?: number;
  weight?: number;
}

export interface DeviceTokenRequest {
  device_token: string;
}

export const userService = {
  get_profile: async (): Promise<UserProfileResponse> => {
    return axiosClient.get('/api/v1/users/profile');
  },

  update_profile: async (data: UpdateProfileRequest): Promise<UserProfileResponse> => {
    return axiosClient.put('/api/v1/users/profile', data);
  },

  update_device_token: async (data: DeviceTokenRequest): Promise<void> => {
    return axiosClient.post('/api/v1/users/device-token', data);
  }
};
