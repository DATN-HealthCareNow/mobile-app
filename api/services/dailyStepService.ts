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
    return axiosClient.post('/api/v1/steps/sync', data);
  },

  get_report: async (startDate: string, endDate: string): Promise<DailyStep[]> => {
    // startDate, endDate format chuẩn ISO (ví dụ: '2023-10-01T00:00:00Z')
    return axiosClient.get(`/api/v1/steps/report?startDate=${startDate}&endDate=${endDate}`);
  }
};
