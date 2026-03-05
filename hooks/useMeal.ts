import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mealService, MealLogRequest } from '../api/services/mealService';

export const MEAL_KEYS = {
  all: ['meals'] as const,
  macros: () => [...MEAL_KEYS.all, 'macros'] as const,
  search: (query: string) => [...MEAL_KEYS.all, 'search', query] as const,
};

export const useSearchFood = (query: string) => {
  return useQuery({
    queryKey: MEAL_KEYS.search(query),
    queryFn: () => mealService.search_food(query),
    enabled: !!query, // Chỉ chạy khi có query string
  });
};

export const useDailyMacros = () => {
  return useQuery({
    queryKey: MEAL_KEYS.macros(),
    queryFn: mealService.get_daily_macros,
  });
};

export const useLogMeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MealLogRequest) => mealService.log_meal(data),
    onSuccess: () => {
      // Refresh component liên quan đến macro hàng ngày
      queryClient.invalidateQueries({ queryKey: MEAL_KEYS.macros() });
    },
  });
};
