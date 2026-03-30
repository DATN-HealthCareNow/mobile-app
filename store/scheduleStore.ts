import { create } from 'zustand';
import { scheduleService, ScheduleCreateRequest, ExerciseSchedule } from '../api/services/scheduleService';

export type ActivityType = 'Running' | 'Gym' | 'Calisthenics' | 'Yoga' | 'Stretching' | 'Cycling' | 'Walking' | 'Pool Laps' | 'HIIT Training';
export type FrequencyType = 'Daily' | 'Weekly' | 'Custom';

export interface ISchedule {
  id: string;
  type: ActivityType;
  frequency: FrequencyType;
  days: string[]; // e.g. ['M', 'T', 'W', 'Th', 'F', 'S', 'Su']
  time: string; // e.g. "07:30 AM"
  goal: string;
  isActive: boolean;
}

// Utility functions
const dayMap: { [key: string]: number } = {
  'Su': 0, 'M': 1, 'T': 2, 'W': 3, 'Th': 4, 'F': 5, 'S': 6
};

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayShortLabels = ['Su', 'M', 'T', 'W', 'Th', 'F', 'S'];

const to24HourTime = (time12: string): string => {
  const [hourStr, minuteStr, period] = time12.split(/[:\s]+/);
  let hour = Number.parseInt(hourStr, 10);
  const minute = Number.parseInt(minuteStr, 10);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return '07:30';
  }

  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;

  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

export const isScheduleToday = (schedule: ISchedule): boolean => {
  if (schedule.frequency === 'Daily') return true;
  
  const today = new Date();
  const todayDay = today.getDay();
  const todayShort = dayShortLabels[todayDay];
  
  return schedule.days.includes(todayShort);
};

export const getNextScheduleDay = (schedule: ISchedule): string => {
  if (!schedule.isActive) return 'Paused';
  
  if (schedule.frequency === 'Daily') return 'Today';
  
  const today = new Date();
  const todayDay = today.getDay();
  const todayShort = dayShortLabels[todayDay];
  
  // Check if today is a scheduled day
  if (schedule.days.includes(todayShort)) {
    return 'Today';
  }
  
  // Find next scheduled day
  for (let i = 1; i <= 7; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(nextDate.getDate() + i);
    const nextDay = nextDate.getDay();
    const nextShort = dayShortLabels[nextDay];
    
    if (schedule.days.includes(nextShort)) {
      if (i === 1) return 'Tomorrow';
      return dayLabels[nextDay];
    }
  }
  
  return 'Next week';
};

interface ScheduleStore {
  schedules: ISchedule[];
  isLoading: boolean;
  addSchedule: (schedule: ISchedule) => Promise<void>;
  loadSchedules: () => Promise<void>;
  toggleSchedule: (id: string) => void;
  deleteSchedule: (id: string) => void;
}

// Dummy initial data to populate the UI (similar to user's mockup)
const initialSchedules: ISchedule[] = [
  {
    id: '1',
    type: 'Running',
    frequency: 'Daily',
    days: [],
    time: '06:00 AM',
    goal: 'Goal: 5 km',
    isActive: true,
  },
  {
    id: '2',
    type: 'Yoga',
    frequency: 'Custom',
    days: ['M', 'W', 'F'],
    time: '07:30 PM',
    goal: 'Mindfulness',
    isActive: true,
  },
  {
    id: '3',
    type: 'Gym',
    frequency: 'Custom',
    days: ['T', 'Th'],
    time: '05:00 PM',
    goal: 'Weight lifting',
    isActive: false,
  }
];

export const useScheduleStore = create<ScheduleStore>((set) => ({
  schedules: [],
  isLoading: false,
  
  addSchedule: async (schedule: ISchedule) => {
    try {
      set({ isLoading: true });
      
      // Map ISchedule to ScheduleCreateRequest format
      const now = new Date();
      const [hourStr, minuteStr, period] = schedule.time.split(/[:\s]+/);
      let hour = Number.parseInt(hourStr, 10);
      const minute = Number.parseInt(minuteStr, 10);
      
      if (period === 'PM' && hour !== 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
        now.setHours(7, 30, 0, 0);
      } else {
        now.setHours(hour, minute, 0, 0);
      }
      
      // Convert day abbreviations to numbers (0=Sun, 1=Mon, etc.)
      const repeatDays = schedule.frequency === 'Daily' 
        ? [0, 1, 2, 3, 4, 5, 6]
        : schedule.days
            .map(day => dayMap[day])
            .filter((d): d is number => Number.isInteger(d));

      const normalizedTime = to24HourTime(schedule.time);
      
      const createRequest: ScheduleCreateRequest = {
        title: `${schedule.type} - ${schedule.goal}`,
        schedule_type: schedule.frequency === 'Daily' || repeatDays.length > 0 ? 'RECURRING' : 'ONE_TIME',
        start_date: now.toISOString(),
        reminder_enabled: schedule.isActive,
        recurrence_config: {
          repeat_days: repeatDays,
          reminder_time: normalizedTime
        }
      };

      console.log('[scheduleStore] createSchedule payload:', JSON.stringify(createRequest));
      
      // Call backend API
      await scheduleService.createSchedule(createRequest);
      
      // Update local state only after successful API call
      set((state) => ({
        schedules: [...state.schedules, schedule],
        isLoading: false
      }));
    } catch (error) {
      console.error('Failed to create schedule:', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  loadSchedules: async () => {
    try {
      set({ isLoading: true });
      const backendSchedules = await scheduleService.getUpcomingSchedules();
      
      // Convert backend ExerciseSchedule format to ISchedule format
      const mappedSchedules = backendSchedules.map(bs => ({
        id: bs.id,
        type: bs.title.split(' - ')[0] as ActivityType,
        frequency: bs.schedule_type === 'RECURRING' ? 'Custom' as FrequencyType : 'Daily' as FrequencyType,
        days: bs.recurrence_config?.repeat_days.map(d => dayShortLabels[d]) || [],
        time: bs.recurrence_config?.reminder_time || '07:00 AM',
        goal: bs.title.split(' - ')[1] || '',
        isActive: bs.reminder_enabled
      })) as ISchedule[];
      
      set({ schedules: mappedSchedules, isLoading: false });
    } catch (error) {
      console.error('Failed to load schedules:', error);
      set({ isLoading: false });
      // Keep local schedules as fallback
    }
  },
  
  toggleSchedule: async (id: string) => {
    try {
      set((state) => ({
        schedules: state.schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
      }));
      await scheduleService.toggleSchedule(id);
    } catch (error) {
      console.error('Failed to toggle schedule:', error);
      // Revert on error
      set((state) => ({
        schedules: state.schedules.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s)
      }));
    }
  },
  
  deleteSchedule: async (id: string) => {
    try {
      const scheduleToDelete = useScheduleStore.getState().schedules.find(s => s.id === id);
      set((state) => ({
        schedules: state.schedules.filter(s => s.id !== id)
      }));
      // Only delete from API if it's likely a backend ID (e.g., > 3 length or specific pattern)
      // Since it's MongoDB, local dummy IDs like '1', '2' shouldn't be deleted via API
      if (id.length > 3) {
        await scheduleService.deleteSchedule(id);
      }
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      // We could revert here, omitted for brevity
    }
  },
}));
