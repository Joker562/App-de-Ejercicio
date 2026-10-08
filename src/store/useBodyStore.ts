import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { BodyEntry } from '../types';
import { createId } from '../utils/format';
import { STORAGE_VERSION, persistStorage } from './storage';

interface BodyState {
  /** Más reciente primero. */
  entries: BodyEntry[];
  addEntry: (entry: Omit<BodyEntry, 'id' | 'date'>) => void;
  removeEntry: (id: string) => void;
}

export const useBodyStore = create<BodyState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (entry) =>
        set((state) => ({
          entries: [{ id: createId(), date: Date.now(), ...entry }, ...state.entries],
        })),
      removeEntry: (id) =>
        set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: 'body-metrics',
      storage: persistStorage,
      version: STORAGE_VERSION,
      // Nuevo en la v1: no hay datos anteriores que migrar.
      migrate: (persisted) => persisted as Pick<BodyState, 'entries'>,
    },
  ),
);
