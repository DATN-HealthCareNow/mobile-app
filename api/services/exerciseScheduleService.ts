import { axiosClient } from '../axiosClient';

export interface ScheduleCreateRequest {
  activity_type: string;
  source: string;
  scheduled_time: string;
  duration_minutes: number;
  recurrence: string; // "NONE", "DAILY", "WEEKLY", etc
}

export interface ExerciseSchedule {
  id: string;
  user_id: string;
  activity_type: string;
  source: string;
  status: string;
  scheduled_time: string;
  duration_minutes: number;
  recurrence_config: any;
  [key: string]: any;
}

export const exerciseScheduleService = {
  create_schedule: async (data: ScheduleCreateRequest): Promise<ExerciseSchedule> => {
    return axiosClient.post('/api/v1/schedules', data);
  },

  get_upcoming_schedules: async (): Promise<ExerciseSchedule[]> => {
    return axiosClient.get('/api/v1/schedules/upcoming');
  },

  update_recurrence: async (id: string, config: any): Promise<ExerciseSchedule> => {
    return axiosClient.put(`/api/v1/schedules/${id}`, config);
  }
};
