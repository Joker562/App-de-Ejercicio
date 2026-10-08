import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GYM_ROUTINES } from '../data/data';
import type { GymRoutine } from '../types';
import { persistStorage } from './storage';

interface RoutineState {
  routines: GymRoutine[];
  saveRoutine: (routine: GymRoutine) => void;
  removeRoutine: (id: string) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set) => ({
      routines: DEFAULT_GYM_ROUTINES,
      saveRoutine: (routine) =>
        set((state) => {
          const exists = state.routines.some((r) => r.id === routine.id);
          return {
            routines: exists
              ? state.routines.map((r) => (r.id === routine.id ? routine : r))
              : [...state.routines, routine],
          };
        }),
      removeRoutine: (id) =>
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) })),
    }),
    { name: 'gym-routines', storage: persistStorage },
  ),
);
