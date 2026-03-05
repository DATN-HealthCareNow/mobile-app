import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sleepSessionService, SleepSyncRequest } from '../api/services/sleepSessionService';

export const SLEEP_KEYS = {
  all: ['sleep'] as const,
  analysis: () => [...SLEEP_KEYS.all, 'analysis'] as const,
};

export const useSleepAnalysis = () => {
  return useQuery({
    queryKey: SLEEP_KEYS.analysis(),
    queryFn: sleepSessionService.get_analysis,
  });
};

export const useSyncSleep = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SleepSyncRequest) => sleepSessionService.sync_sleep(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLEEP_KEYS.analysis() });
    },
  });
};

export const useUpdateSleepSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => sleepSessionService.update_schedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SLEEP_KEYS.analysis() });
    },
  });
};
