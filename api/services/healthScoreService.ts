import { axiosClient } from '../axiosClient';

export interface HealthScoreSummaryDTO {
  overall_score: number;
  sleep_score: number;
  nutrition_score: number;
  activity_score: number;
  [key: string]: any;
}

export interface HealthScore {
  id: string;
  user_id: string;
  overall_score: number;
  sleep_score: number;
  nutrition_score: number;
  activity_score: number;
  created_at: string;
  [key: string]: any;
}

export const healthScoreService = {
  get_history: async (): Promise<HealthScore[]> => {
    return axiosClient.get('/api/v1/health/scores/history');
  },

  get_today_summary: async (): Promise<HealthScoreSummaryDTO> => {
    return axiosClient.get('/api/v1/health/summary/today');
  },

  calculate_score: async (): Promise<void> => {
    return axiosClient.post('/api/v1/health/calculate');
  }
};
