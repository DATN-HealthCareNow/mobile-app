import { axiosClient } from '../axiosClient';

export interface WaterLogRequest {
  amount_ml: number;
  adjustment_reason?: string;
}

export interface WaterLogDTO {
  amount_ml: number;
  adjustment_reason: string;
  time: string;
}

export interface WaterProgressDTO {
  current_amount: number;
  goal_amount: number;
  percentage: number;
  logs?: WaterLogDTO[];
  [key: string]: any;
}

export const waterIntakeService = {
  log_water: async (data: WaterLogRequest): Promise<any> => {
    return axiosClient.post('/api/v1/water-intake/log', data);
  },

  get_progress: async (): Promise<WaterProgressDTO> => {
    // core-service endpoint mapped via gateway (if same host), adjust if necessary
    // Trỏ về core-service theo thiết kế microservices mới
    return axiosClient.get('/api/v1/water-intake/progress');
  },

  get_logs: async (): Promise<any> => {
    // iot-service endpoint cho list activity trong ngày
    return axiosClient.get('/api/v1/water/logs/today');
  },

  update_goal: async (data: WaterLogRequest): Promise<void> => {
    return axiosClient.put('/api/v1/water-intake/goal', data);
  }
};
