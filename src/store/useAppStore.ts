import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TrainingMode, WeightUnit } from '../types';
import { STORAGE_VERSION, persistStorage } from './storage';

interface AppState {
  mode: TrainingMode;
  unit: WeightUnit;
  setMode: (mode: TrainingMode) => void;
  setUnit: (unit: WeightUnit) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'military',
      unit: 'kg',
      setMode: (mode) => set({ mode }),
      setUnit: (unit) => set({ unit }),
    }),
    {
      name: 'app-settings',
      storage: persistStorage,
      version: STORAGE_VERSION,
      // v0 -> v1: los ajustes no cambiaron.
      migrate: (persisted) => persisted as Pick<AppState, 'mode' | 'unit'>,
    },
  ),
);
