import { create } from 'zustand';

export interface GoalStore {
  stepsGoal: number;
  caloriesGoal: number;
  setStepsGoal: (goal: number) => void;
  setCaloriesGoal: (goal: number) => void;
}

export const useGoalStore = create<GoalStore>((set) => ({
  stepsGoal: 10000,
  caloriesGoal: 500,
  setStepsGoal: (goal) => set({ stepsGoal: goal }),
  setCaloriesGoal: (goal) => set({ caloriesGoal: goal }),
}));
