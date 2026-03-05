import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService, ActivityStartRequest, ActivityFinishRequest, HeartRateUpdateRequest } from '../api/services/activityService';

export const ACTIVITY_KEYS = {
  all: ['activities'] as const,
  list: (userId: string) => [...ACTIVITY_KEYS.all, 'list', userId] as const,
};

export const useUserActivities = (userId: string, page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: [...ACTIVITY_KEYS.list(userId), page, size],
    queryFn: () => activityService.get_user_activities(userId, page, size),
    enabled: !!userId, // chỉ chạy khi đã có userId (sau khi đăng nhập)
  });
};

export const useStartActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ActivityStartRequest) => activityService.start(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.all });
    },
  });
};

export const useUpdateHeartRate = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HeartRateUpdateRequest }) =>
      activityService.update_heart_rate(id, data),
  });
};

export const useFinishActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: ActivityFinishRequest }) =>
      activityService.finish(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITY_KEYS.all });
    },
  });
};
