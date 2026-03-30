import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waterIntakeService, WaterLogRequest } from '../api/services/waterIntakeService';

export const WATER_KEYS = {
  all: ['water'] as const,
  progress: () => [...WATER_KEYS.all, 'progress'] as const,
  logs: () => [...WATER_KEYS.all, 'logs'] as const,
};

export const useWaterProgress = () => {
  return useQuery({
    queryKey: WATER_KEYS.progress(),
    queryFn: waterIntakeService.get_progress,
  });
};

export const useWaterLogs = () => {
  return useQuery({
    queryKey: WATER_KEYS.logs(),
    queryFn: waterIntakeService.get_logs,
  });
};

export const useLogWater = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WaterLogRequest) => waterIntakeService.log_water(data),
    onSuccess: () => {
      // Invalidate để kéo lại cả progress (từ core) và log (từ iot)
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.progress() });
      queryClient.invalidateQueries({ queryKey: WATER_KEYS.logs() });
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
