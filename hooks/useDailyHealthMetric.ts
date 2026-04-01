import { useQuery } from '@tanstack/react-query';
import { iotService } from '../api/services/iotService';

export const DAILY_HEALTH_KEYS = {
  all: ['daily-health'] as const,
  byDate: (dateString: string) => [...DAILY_HEALTH_KEYS.all, dateString] as const,
};

export const useDailyHealthMetric = (dateString: string) => {
  return useQuery({
    queryKey: DAILY_HEALTH_KEYS.byDate(dateString),
    queryFn: () => iotService.getDailyHealth(dateString),
    enabled: !!dateString,
  });
};
