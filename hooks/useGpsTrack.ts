import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gpsTrackService, GpsBatchRequest } from '../api/services/gpsTrackService';

export const GPS_KEYS = {
  all: ['gps-tracks'] as const,
  activity: (activityId: string) => [...GPS_KEYS.all, activityId] as const,
};

export const useGpsTrack = (activityId: string) => {
  return useQuery({
    queryKey: GPS_KEYS.activity(activityId),
    queryFn: () => gpsTrackService.get_track(activityId),
    enabled: !!activityId,
  });
};

export const useBatchGpsPoints = () => {
  // Không cần invalidate vì thường batch point là async action (với 202 Accepted)
  // và mobile app đang chủ động keep track state trên local.
  return useMutation({
    mutationFn: ({ activityId, data }: { activityId: string; data: GpsBatchRequest }) =>
      gpsTrackService.batch_points(activityId, data),
  });
};
