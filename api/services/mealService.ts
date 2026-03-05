import { axiosClient } from '../axiosClient';

export interface FoodDatabase {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  [key: string]: any;
}

export interface MealLogRequest {
  meal_type: string;
  food_items: any[];
  [key: string]: any;
}

export interface MealMacroDTO {
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  [key: string]: any;
}

export const mealService = {
  search_food: async (query: string): Promise<FoodDatabase[]> => {
    return axiosClient.get(`/api/v1/food/search?query=${query}`);
  },

  log_meal: async (data: MealLogRequest): Promise<any> => {
    return axiosClient.post('/api/v1/meals/log', data);
  },

  get_daily_macros: async (): Promise<MealMacroDTO> => {
    return axiosClient.get('/api/v1/meals/macros');
  }
};
