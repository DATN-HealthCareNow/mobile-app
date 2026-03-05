import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { healthScoreService } from '../api/services/healthScoreService';

export const HEALTH_SCORE_KEYS = {
  all: ['health-score'] as const,
  history: () => [...HEALTH_SCORE_KEYS.all, 'history'] as const,
  today: () => [...HEALTH_SCORE_KEYS.all, 'today'] as const,
};

export const useHealthScoreHistory = () => {
  return useQuery({
    queryKey: HEALTH_SCORE_KEYS.history(),
    queryFn: healthScoreService.get_history,
  });
};

export const useHealthScoreToday = () => {
  return useQuery({
    queryKey: HEALTH_SCORE_KEYS.today(),
    queryFn: healthScoreService.get_today_summary,
  });
};

export const useCalculateHealthScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: healthScoreService.calculate_score,
    onSuccess: () => {
      // Khi tính xong, fetch lại data today và history để update UI
      queryClient.invalidateQueries({ queryKey: HEALTH_SCORE_KEYS.all });
    },
  });
};
