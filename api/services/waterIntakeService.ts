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
  total_today_ml?: number;
  goal_ml?: number;
  progress_percent?: number;
  current_amount?: number;
  goal_amount?: number;
  percentage?: number;
  logs?: WaterLogDTO[];
  [key: string]: any;
}

export interface HydrationAggregateDTO {
  progress: WaterProgressDTO;
  logs: WaterLogDTO[];
}

export const waterIntakeService = {
  log_water: async (data: WaterLogRequest): Promise<any> => {
    return axiosClient.post('/api/v1/bff/mobile/hydration/log', data);
  },

  get_hydration: async (): Promise<HydrationAggregateDTO> => {
    return axiosClient.get('/api/v1/bff/mobile/hydration');
  },

  get_progress: async (): Promise<WaterProgressDTO> => {
    const aggregate = await waterIntakeService.get_hydration();
    return aggregate.progress;
  },

  get_logs: async (): Promise<WaterLogDTO[]> => {
    const aggregate = await waterIntakeService.get_hydration();
    return aggregate.logs;
  },

  update_goal: async (data: WaterLogRequest): Promise<void> => {
    return axiosClient.put('/api/v1/water-intake/goal', data);
  }
};
