import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DeviceTokenRequest,
  UpdateProfileRequest,
  userService,
} from "../api/services/userService";

// Key dùng để cache query
export const USER_KEYS = {
  profile: ["user", "profile"] as const,
};

export const useProfile = (token?: string | null) => {
  return useQuery({
    queryKey: [...USER_KEYS.profile, token],
    queryFn: async () => {
      console.log("[useProfile] Triggering fetch with token:", token ? token.substring(0, 10) + "..." : "NONE");
      const result = await userService.get_profile();
      return result;
    },
    enabled: !!token,
    staleTime: 0, // Force fresh data
    gcTime: 0,    // Do not cache
    refetchOnMount: "always",
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) =>
      userService.update_profile(data),
    onSuccess: () => {
      // Invalidate the cache to ensure fresh data is fetched across all active queries matching the base key
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile });
    },
  });
};

export const useUpdateDeviceToken = () => {
  return useMutation({
    mutationFn: (data: DeviceTokenRequest) =>
      userService.update_device_token(data),
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => userService.upload_avatar(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.profile });
    },
  });
};
