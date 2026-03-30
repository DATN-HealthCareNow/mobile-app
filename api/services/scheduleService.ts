import { axiosClient } from '../axiosClient';
import { AxiosError } from 'axios';

export interface RecurrenceConfig {
  repeat_days: number[];
  reminder_time: string; // HH:MM format
}

export interface ScheduleCreateRequest {
  title: string;
  schedule_type: 'ONE_TIME' | 'RECURRING';
  start_date: string; // ISO 8601 format
  reminder_enabled: boolean;
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
      const response = await axiosClient.get<ExerciseSchedule[]>(
        '/api/v1/schedules/upcoming'
      ) as unknown as ExerciseSchedule[];
      return response;
    } catch (error) {
      console.error('Error fetching upcoming schedules:', error);
      const axiosError = error as AxiosError;
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
}

export const scheduleService = new ScheduleService();
