import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { DEFAULT_GYM_ROUTINES } from '../data/data';
import { resolveExerciseId } from '../data/exercises';
import type { GymRoutine } from '../types';
import { createId } from '../utils/format';
import { STORAGE_VERSION, persistStorage } from './storage';

/** ids de las rutinas de serie en la v0 -> plantilla equivalente. */
const LEGACY_DEFAULT_TEMPLATES: Record<string, string> = {
  push: 'ppl-push',
  pull: 'ppl-pull',
  legs: 'ppl-legs',
};

interface RoutineState {
  routines: GymRoutine[];
  saveRoutine: (routine: GymRoutine) => void;
  /** Copia rutinas precreadas a "Mis rutinas", omitiendo las que ya estén. */
  addFromTemplates: (templates: GymRoutine[]) => number;
  removeRoutine: (id: string) => void;
}

export const useRoutineStore = create<RoutineState>()(
  persist(
    (set, get) => ({
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
      addFromTemplates: (templates) => {
        const existing = new Set(get().routines.map((r) => r.templateId));
        const fresh = templates
          .filter((t) => !existing.has(t.id))
          .map((t) => ({ ...t, id: createId(), templateId: t.id }));
        set((state) => ({ routines: [...state.routines, ...fresh] }));
        return fresh.length;
      },
      removeRoutine: (id) =>
        set((state) => ({ routines: state.routines.filter((r) => r.id !== id) })),
    }),
    {
      name: 'gym-routines',
      storage: persistStorage,
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        const state = persisted as Pick<RoutineState, 'routines'>;
        if (version < 1 && Array.isArray(state?.routines)) {
          state.routines = state.routines.map((r) => ({
            ...r,
            // Las Push/Pull/Legs de serie de la v0 son las del programa PPL.
            templateId: r.templateId ?? LEGACY_DEFAULT_TEMPLATES[r.id],
            exercises: r.exercises.map((e) => ({
              ...e,
              exerciseId: resolveExerciseId(e.exerciseId),
            })),
          }));
        }
        return state;
      },
    },
  ),
);
