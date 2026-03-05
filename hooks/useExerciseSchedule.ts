import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseScheduleService, ScheduleCreateRequest } from '../api/services/exerciseScheduleService';

export const SCHEDULE_KEYS = {
  all: ['schedules'] as const,
  upcoming: () => [...SCHEDULE_KEYS.all, 'upcoming'] as const,
};

export const useUpcomingSchedules = () => {
  return useQuery({
    queryKey: SCHEDULE_KEYS.upcoming(),
    queryFn: exerciseScheduleService.get_upcoming_schedules,
  });
};

export const useCreateSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ScheduleCreateRequest) => exerciseScheduleService.create_schedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.upcoming() });
    },
  });
};

export const useUpdateRecurrence = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: any }) =>
      exerciseScheduleService.update_recurrence(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEYS.upcoming() });
    },
  });
};
