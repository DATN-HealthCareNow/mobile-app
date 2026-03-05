import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dailyStepService, DailyStepSyncRequest } from '../api/services/dailyStepService';

export const STEP_KEYS = {
  all: ['steps'] as const,
  report: (startDate: string, endDate: string) => [...STEP_KEYS.all, 'report', startDate, endDate] as const,
};

export const useStepReport = (startDate: string, endDate: string) => {
  return useQuery({
    queryKey: STEP_KEYS.report(startDate, endDate),
    queryFn: () => dailyStepService.get_report(startDate, endDate),
    enabled: !!startDate && !!endDate,
  });
};

export const useSyncSteps = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DailyStepSyncRequest) => dailyStepService.sync_steps(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STEP_KEYS.all });
    },
  });
};
