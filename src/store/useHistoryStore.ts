import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { resolveExerciseId } from '../data/exercises';
import type { Session } from '../types';
import { STORAGE_VERSION, persistStorage } from './storage';

interface HistoryState {
  /** Más reciente primero. */
  sessions: Session[];
  addSession: (session: Session) => void;
  removeSession: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      sessions: [],
      addSession: (session) =>
        set((state) => ({ sessions: [session, ...state.sessions] })),
      removeSession: (id) =>
        set((state) => ({ sessions: state.sessions.filter((s) => s.id !== id) })),
      clearHistory: () => set({ sessions: [] }),
    }),
    {
      name: 'workout-history',
      storage: persistStorage,
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        const state = persisted as Pick<HistoryState, 'sessions'>;
        if (version < 1 && Array.isArray(state?.sessions)) {
          // ids de ejercicios de la v0 -> actuales, para que los récords no se separen.
          state.sessions = state.sessions.map((s) => ({
            ...s,
            exercises: s.exercises.map((e) => ({
              ...e,
              exerciseId: e.exerciseId && resolveExerciseId(e.exerciseId),
            })),
          }));
        }
        return state;
      },
    },
  ),
);
