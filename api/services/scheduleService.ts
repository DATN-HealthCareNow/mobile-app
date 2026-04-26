import { axiosClient } from '../axiosClient';
import * as SecureStore from 'expo-secure-store';
import { AxiosError } from 'axios';

export interface RecurrenceConfig {
  repeat_days: number[];
  reminder_time?: string; // HH:MM format
  reminder_times?: string[]; // Multiple HH:MM format
}

export interface ScheduleCreateRequest {
  title: string;
  schedule_type: 'ONE_TIME' | 'RECURRING';
  start_date: string; // ISO 8601 format
  reminder_enabled: boolean;
  source_id?: string;
  diagnosis?: string;
  medications?: any[];
  recurrence_config?: RecurrenceConfig;
}

export interface ExerciseSchedule {
  id: string;
  user_id: string;
  title: string;
  schedule_type: 'ONE_TIME' | 'RECURRING';
  start_date: string;
  reminder_enabled: boolean;
  recurrence_config?: RecurrenceConfig;
  source_id?: string;
  diagnosis?: string;
  medications?: any[];
}

class ScheduleService {
  async createSchedule(request: ScheduleCreateRequest): Promise<ExerciseSchedule> {
    try {
      const response = await axiosClient.post<ExerciseSchedule>(
        '/api/v1/schedules',
        request
      ) as unknown as ExerciseSchedule;
      return response;
    } catch (error) {
      console.error('Error creating schedule:', error);
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error('[scheduleService] createSchedule status:', axiosError.response.status);
        console.error('[scheduleService] createSchedule response:', JSON.stringify(axiosError.response.data));
      }
      throw error;
    }
  }

  async getUpcomingSchedules(): Promise<ExerciseSchedule[]> {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        // Silent fail nếu chưa login - không throw error
        if (__DEV__) {
          console.log('[scheduleService] No token found, skipping getUpcomingSchedules');
        }
        return [];
      }

      const response = await axiosClient.get<ExerciseSchedule[]>(
        '/api/v1/schedules/upcoming'
      ) as unknown as ExerciseSchedule[];
      return response;
    } catch (error) {
      const axiosError = error as AxiosError;
      // Nếu 401, chỉ log warning (không log error spam)
      if (axiosError.response?.status === 401) {
        if (__DEV__) {
          console.warn('[scheduleService] getUpcomingSchedules: Unauthorized - user may have logged out');
        }
        return [];
      }
      
      // Xử lý riêng Network Error để không văng màn hình đỏ
      if (axiosError.message === 'Network Error') {
         console.warn('[scheduleService] getUpcomingSchedules: Network Error. Server may be down or unreachable.');
         throw error;
      }

      // Các error khác thì log error bình thường
      console.error('Error fetching upcoming schedules:', error);
      if (axiosError.response) {
        console.error('[scheduleService] getUpcomingSchedules status:', axiosError.response.status);
        console.error('[scheduleService] getUpcomingSchedules response:', JSON.stringify(axiosError.response.data));
      }
      throw error;
    }
  }

  async updateRecurrence(
    scheduleId: string,
    config: RecurrenceConfig
  ): Promise<ExerciseSchedule> {
    try {
      const response = await axiosClient.put<ExerciseSchedule>(
        `/api/v1/schedules/${scheduleId}`,
        config
      ) as unknown as ExerciseSchedule;
      return response;
    } catch (error) {
      console.error('Error updating schedule recurrence:', error);
      throw error;
    }
  }

  async toggleSchedule(scheduleId: string): Promise<ExerciseSchedule> {
    try {
      const response = await axiosClient.put<ExerciseSchedule>(
        `/api/v1/schedules/${scheduleId}/toggle`
      ) as unknown as ExerciseSchedule;
      return response;
    } catch (error) {
      console.error('Error toggling schedule:', error);
      throw error;
    }
  }

  async deleteSchedule(scheduleId: string): Promise<void> {
    try {
      await axiosClient.delete(
        `/api/v1/schedules/${scheduleId}`
      );
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }

  async deleteSchedules(scheduleIds: string[]): Promise<void> {
    try {
      await axiosClient.delete(
        `/api/v1/schedules/batch`,
        { data: scheduleIds }
      );
    } catch (error) {
      console.error('Error deleting schedules in batch:', error);
      throw error;
    }
  }
}

export const scheduleService = new ScheduleService();
