import { axiosClient } from '../axiosClient';

export interface ActivityStartRequest {
  type: string;
  mode: string;
}

export interface HeartRateUpdateRequest {
  heart_rate: number;
  timestamp: string;
}

export interface ActivityFinishRequest {
  end_at?: string;
  active_calories?: number;
  exercise_minutes?: number;
  calories_burned?: number; // legacy
  distance_meter?: number;
  avg_heart_rate?: number;
  workoutLogs?: {
    exercise: string;
    reps: number;
    weight: number;
  }[];
}

export interface Activity {
  id: string;
  user_id: string;
  type: string;
  source: string;
  status: string;
  start_at: string;
  end_at?: string;
  calories_burned?: number;
  distance_meter?: number;
  avg_heart_rate?: number;
  [key: string]: any;
}

export const activityService = {
  start: async (data: ActivityStartRequest): Promise<Activity> => {
    return axiosClient.post('/api/v1/activities/start', data);
  },

  update_heart_rate: async (id: string, data: HeartRateUpdateRequest): Promise<void> => {
    return axiosClient.patch(`/api/v1/activities/${id}/heart-rate`, data);
  },

  finish: async (id: string, data?: ActivityFinishRequest): Promise<Activity> => {
    return axiosClient.post(`/api/v1/activities/${id}/finish`, data || {});
  },

  get_user_activities: async (userId: string, page: number = 0, size: number = 20): Promise<any> => {
    return axiosClient.get(`/api/v1/activities/user/${userId}?page=${page}&size=${size}`);
  }
};
