import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Sex, TrainingMode, WeightUnit } from '../types';
import { STORAGE_VERSION, persistStorage } from './storage';

interface AppState {
  mode: TrainingMode;
  unit: WeightUnit;
  /** Descanso para ejercicios nuevos (creador de rutinas y añadidos en sesión). */
  defaultRestSec: number;
  /** Iniciar la cuenta atrás de descanso al completar una serie. */
  autoRest: boolean;
  /** Voz en los temporizadores ("3, 2, 1", "Descanso"...). */
  voiceCues: boolean;
  /** Para la nota de la prueba física; opcionales hasta que se piden. */
  age?: number;
  sex?: Sex;
  /** Pasos de progresiones de calistenia marcados como dominados a mano. */
  masteredSteps: string[];
  /** Ejercicios del catálogo marcados como favoritos. */
  favoriteExercises: string[];
  setMode: (mode: TrainingMode) => void;
  setUnit: (unit: WeightUnit) => void;
  setDefaultRestSec: (seconds: number) => void;
  setAutoRest: (enabled: boolean) => void;
  setVoiceCues: (enabled: boolean) => void;
  setProfile: (profile: { age?: number; sex?: Sex }) => void;
  toggleMastered: (stepId: string) => void;
  toggleFavorite: (exerciseId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'military',
      unit: 'kg',
      defaultRestSec: 90,
      autoRest: true,
      voiceCues: true,
      masteredSteps: [],
      favoriteExercises: [],
      setMode: (mode) => set({ mode }),
      setUnit: (unit) => set({ unit }),
      setDefaultRestSec: (defaultRestSec) => set({ defaultRestSec }),
      setAutoRest: (autoRest) => set({ autoRest }),
      setVoiceCues: (voiceCues) => set({ voiceCues }),
      setProfile: (profile) => set(profile),
      toggleMastered: (stepId) =>
        set((state) => ({
          masteredSteps: state.masteredSteps.includes(stepId)
            ? state.masteredSteps.filter((id) => id !== stepId)
            : [...state.masteredSteps, stepId],
        })),
      toggleFavorite: (exerciseId) =>
        set((state) => ({
          favoriteExercises: state.favoriteExercises.includes(exerciseId)
            ? state.favoriteExercises.filter((id) => id !== exerciseId)
            : [...state.favoriteExercises, exerciseId],
        })),
    }),
    {
      name: 'app-settings',
      storage: persistStorage,
      version: STORAGE_VERSION,
      // v0 -> v1: los ajustes no cambiaron. Los campos añadidos después
      // (descanso, voz, perfil, progresiones, favoritos) toman su valor por defecto al
      // fusionarse con el estado inicial.
      migrate: (persisted) => persisted as Partial<AppState>,
    },
  ),
);
