import { axiosClient } from '../axiosClient';

export interface SleepSyncRequest {
  start_time: string; // ISO String
  end_time: string;   // ISO String
  // Có thể thêm mảng các phases (Deep sleep, light sleep) nếu Watch/Mobile đo được.
}

export interface SleepAnalysisDTO {
  total_duration_hours: number;
  sleep_score: number;
  efficiency: number;
  insights: string[];
  [key: string]: any;
}

export const sleepSessionService = {
  sync_sleep: async (data: SleepSyncRequest): Promise<any> => {
    return axiosClient.post('/api/v1/sleep/sync', data);
  },

  get_analysis: async (): Promise<SleepAnalysisDTO> => {
    return axiosClient.get('/api/v1/sleep/analysis');
  },

  update_schedule: async (data: any): Promise<void> => {
    return axiosClient.put('/api/v1/sleep/schedule', data);
  }
};
