import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterIntakeService, WaterLogRequest } from '../api/services/waterIntakeService';

export const WATER_KEYS = {
  all: ['water'] as const,
  progress: () => [...WATER_KEYS.all, 'progress'] as const,
};

export const useWaterProgress = () => {
  return useQuery({
    queryKey: WATER_KEYS.progress(),
    queryFn: waterIntakeService.get_progress,
  });
};

export const useLogWater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaterLogRequest) => waterIntakeService.log_water(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.progress() });
    },
  });
};

export const useUpdateWaterGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaterLogRequest) => waterIntakeService.update_goal(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.progress() });
    },
  });
};
