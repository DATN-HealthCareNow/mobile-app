import { axiosClient } from '../axiosClient';

export interface DailyStepSyncRequest {
  steps: number;
  source: string;
  date: string;
}

export interface DailyStep {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  calories_earned: number;
  distance_meter: number;
  source: string;
}

export const dailyStepService = {
  sync_steps: async (data: DailyStepSyncRequest): Promise<DailyStep> => {
    // Convert to DailyHealth payload for iot-service health-sync
    const payload = {
      date_string: data.date,
      source: data.source,
      metrics: {
        steps: data.steps,
      }
    };
    return axiosClient.post('/api/v1/tracking/health-sync', payload);
  },

  get_report: async (startDate: string, endDate: string): Promise<any[]> => {
    // startDate, endDate format chuẩn ISO (ví dụ: '2023-10-01T00:00:00Z')
    // We pass it to tracking report which expects string dates like 'YYYY-MM-DD'
    return axiosClient.get(`/api/v1/tracking/report?startDate=${startDate}&endDate=${endDate}`);
  }
};
