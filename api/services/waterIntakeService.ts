import { axiosClient } from '../axiosClient';

export interface WaterLogRequest {
  amount_ml: number;
  adjustment_reason?: string;
}

export interface WaterProgressDTO {
  current_amount: number;
  goal_amount: number;
  percentage: number;
  [key: string]: any;
}

export const waterIntakeService = {
  log_water: async (data: WaterLogRequest): Promise<any> => {
    return axiosClient.post('/api/v1/water/log', data);
  },

  get_progress: async (): Promise<WaterProgressDTO> => {
    return axiosClient.get('/api/v1/water/progress');
  },

  update_goal: async (data: WaterLogRequest): Promise<void> => {
    return axiosClient.put('/api/v1/water/goal', data);
  }
};
