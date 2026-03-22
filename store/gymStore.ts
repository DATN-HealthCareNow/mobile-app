import { create } from 'zustand';

export interface WorkoutSet {
  reps: number;
  weight: number;
}

export interface CompletedExercise {
  name: string;
  sets: WorkoutSet[];
}

interface GymStore {
  isActive: boolean;
  startTime: number | null;
  exercises: CompletedExercise[];
  
  startWorkout: () => void;
  finishWorkout: () => void;
  resetWorkout: () => void;
  addExerciseSets: (name: string, sets: WorkoutSet[]) => void;
}

export const useGymStore = create<GymStore>((set) => ({
  isActive: false,
  startTime: null,
  exercises: [],

  startWorkout: () => 
    set((state) => {
      if (!state.isActive) {
        return { isActive: true, startTime: Date.now(), exercises: [] };
      }
      return state;
    }),

  finishWorkout: () => 
    set(() => ({ isActive: false })),

  resetWorkout: () => 
    set(() => ({ isActive: false, startTime: null, exercises: [] })),

  addExerciseSets: (name, sets) => 
    set((state) => {
      // Tìm xem bài tập có chưa, nếu có update, ko thì append
      const existingIdx = state.exercises.findIndex(e => e.name === name);
      if (existingIdx !== -1) {
        const updated = [...state.exercises];
        updated[existingIdx].sets.push(...sets);
        return { exercises: updated };
      }
      return { exercises: [...state.exercises, { name, sets }] };
    })
}));
