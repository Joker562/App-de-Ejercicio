import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Session } from '../types';
import { persistStorage } from './storage';

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
    { name: 'workout-history', storage: persistStorage },
  ),
);
