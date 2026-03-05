import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, UpdateProfileRequest, DeviceTokenRequest } from '../api/services/userService';

// Key dùng để cache query
export const USER_KEYS = {
  profile: ['user', 'profile'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: USER_KEYS.profile,
    queryFn: userService.get_profile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userService.update_profile(data),
    onSuccess: (updatedProfile) => {
      // Tự động update cache với data mới nhất mà không cần refetch
      queryClient.setQueryData(USER_KEYS.profile, updatedProfile);
    },
  });
};

export const useUpdateDeviceToken = () => {
  return useMutation({
    mutationFn: (data: DeviceTokenRequest) => userService.update_device_token(data),
  });
};
