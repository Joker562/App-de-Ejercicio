import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { TrainingMode, WeightUnit } from '../types';
import { STORAGE_VERSION, persistStorage } from './storage';

interface AppState {
  mode: TrainingMode;
  unit: WeightUnit;
  /** Descanso para ejercicios nuevos (creador de rutinas y añadidos en sesión). */
  defaultRestSec: number;
  /** Iniciar la cuenta atrás de descanso al completar una serie. */
  autoRest: boolean;
  setMode: (mode: TrainingMode) => void;
  setUnit: (unit: WeightUnit) => void;
  setDefaultRestSec: (seconds: number) => void;
  setAutoRest: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'military',
      unit: 'kg',
      defaultRestSec: 90,
      autoRest: true,
      setMode: (mode) => set({ mode }),
      setUnit: (unit) => set({ unit }),
      setDefaultRestSec: (defaultRestSec) => set({ defaultRestSec }),
      setAutoRest: (autoRest) => set({ autoRest }),
    }),
    {
      name: 'app-settings',
      storage: persistStorage,
      version: STORAGE_VERSION,
      // v0 -> v1: los ajustes no cambiaron. Los campos nuevos (descanso) toman
      // su valor por defecto al fusionarse con el estado inicial.
      migrate: (persisted) => persisted as Partial<AppState>,
    },
  ),
);
