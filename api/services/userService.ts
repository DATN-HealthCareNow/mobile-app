import { axiosClient } from "../axiosClient";

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

export interface TrackingRequest {
  lat?: number;
  lng?: number;
  status?: string;
}

export const userService = {
  get_profile: async (): Promise<UserProfileResponse> => {
    const response = await axiosClient.get("/api/v1/users/profile") as UserProfileResponse;
    console.log("[userService] get_profile response body:", JSON.stringify(response));
    return response;
  },

  update_profile: async (
    data: UpdateProfileRequest,
  ): Promise<UserProfileResponse> => {
    const response = await axiosClient.put("/api/v1/users/profile", data) as UserProfileResponse;
    console.log("[userService] update_profile response body:", JSON.stringify(response));
    return response;
  },

  update_device_token: async (data: DeviceTokenRequest): Promise<void> => {
    const response = await axiosClient.post("/api/v1/users/device-token", data);
    console.log("[userService] update_device_token response:", JSON.stringify(response));
  },

  upload_avatar: async (formData: FormData): Promise<string> => {
    const response = await axiosClient.post<string>(
      "/api/v1/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    ) as unknown as string;
    return response;
  },

  update_tracking: async (data: TrackingRequest): Promise<void> => {
    try {
      await axiosClient.post("/api/v1/users/tracking", data);
    } catch (e) {
      console.warn("Failed to update tracking:", e);
    }
  },
};
