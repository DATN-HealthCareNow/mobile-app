import { axiosClient } from '../axiosClient';

export interface DailyHealthMetrics {
  steps?: number;
  exerciseMinutes?: number;
  activeCalories?: number;
  restingCalories?: number;
  sleepMinutes?: number;
  waterConsumedMl?: number;
}

export interface HealthSyncPayload {
  userId: string;
  dateString: string;
  rawDate: string;
  source?: string;
  metrics: DailyHealthMetrics;
}

export const iotService = {
  syncHealthData: (payload: HealthSyncPayload) => {
    return axiosClient.post('/api/v1/tracking/health-sync', payload);
  },
  
  seedHealthData: (userId: string, days: number = 7) => {
    return axiosClient.get(`/api/v1/tracking/seed-health-data?userId=${userId}&days=${days}`);
  }
};
