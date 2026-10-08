import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TrainingMode, WeightUnit } from '../types';
import { persistStorage } from './storage';

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
    { name: 'app-settings', storage: persistStorage },
  ),
);
