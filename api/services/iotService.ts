import { axiosClient } from '../axiosClient';

export interface DailyHealthMetrics {
  steps?: number;
  exercise_minutes?: number;
  google_exercise_minutes?: number;
  active_minutes?: number;
  distance_meters?: number;
  total_calories?: number;
  active_calories?: number;
  sleep_minutes?: number;
  heart_rate?: number;
  resting_heart_rate?: number;
}

export interface HealthSyncPayload {
  user_id?: string;
  date_string: string;
  date_string_local?: string;
  raw_date: string;
  source?: string;
  metrics: DailyHealthMetrics;
}

export interface DailyHealthDTO {
  id?: string;
  user_id: string;
  date_string: string;
  date_string_local?: string;
  raw_date: string;
  source?: string;
  metrics: DailyHealthMetrics;
}

export const iotService = {
  syncHealthData: (payload: HealthSyncPayload): Promise<DailyHealthDTO> => {
    return axiosClient.post('/api/v1/tracking/health-sync', payload);
  },

  getDailyHealth: (dateString?: string): Promise<DailyHealthDTO> => {
    const query = dateString ? `?date=${encodeURIComponent(dateString)}` : '';
    return axiosClient.get(`/api/v1/tracking/daily${query}`);
  },
  
  seedHealthData: (_userId: string, days: number = 7) => {
    return axiosClient.get(`/api/v1/tracking/seed-health-data?days=${days}`);
  }
};
