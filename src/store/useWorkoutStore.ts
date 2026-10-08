import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { findExercise } from '../data/data';
import type {
  ActiveWorkout,
  GymRoutine,
  MilitaryProgram,
  Session,
  WorkoutSet,
} from '../types';
import {
  IDLE_CLOCK,
  clockElapsedMs,
  pauseClock,
  startClock,
  type ClockState,
} from '../utils/clock';
import { createId } from '../utils/format';
import { pendingAlerts } from '../utils/intervals';
import { cancelAlerts, scheduleAlerts } from '../utils/notifications';

function scheduleRestAlert(endsAt: number) {
  scheduleAlerts('rest', [
    {
      inSec: (endsAt - Date.now()) / 1000,
      title: 'Descanso terminado',
      body: '¡A por la siguiente serie!',
    },
  ]);
}

function cancelWorkoutAlerts() {
  cancelAlerts('rest');
  cancelAlerts('workout-timer');
}
import { resolveExerciseId } from '../data/exercises';
import { useHistoryStore } from './useHistoryStore';
import { STORAGE_VERSION, persistStorage } from './storage';

interface RestTimer {
  endsAt: number;
  durationSec: number;
}

interface WorkoutState {
  active: ActiveWorkout | null;
  rest: RestTimer | null;
  /** Reloj del temporizador AMRAP/EMOM/Tabata del entrenamiento activo. */
  clock: ClockState;

  startMilitary: (program: MilitaryProgram) => void;
  startGym: (routine: GymRoutine) => void;
  toggleSet: (exerciseId: string, setId: string) => void;
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<Pick<WorkoutSet, 'reps' | 'weightKg'>>,
  ) => void;
  addSet: (exerciseId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  addRound: () => void;
  startRest: (durationSec: number) => void;
  extendRest: (seconds: number) => void;
  skipRest: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  /** Guarda la sesión en el historial y limpia el entrenamiento activo. */
  finishWorkout: () => Session | null;
  cancelWorkout: () => void;
}

function newSet(reps = 0, weightKg = 0): WorkoutSet {
  return { id: createId(), reps, weightKg, completed: false };
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => {
      const mapExercise = (
        exerciseId: string,
        fn: (sets: WorkoutSet[]) => WorkoutSet[],
      ) =>
        set((state) =>
          state.active
            ? {
                active: {
                  ...state.active,
                  exercises: state.active.exercises.map((ex) =>
                    ex.id === exerciseId ? { ...ex, sets: fn(ex.sets) } : ex,
                  ),
                },
              }
            : state,
        );

      return {
        active: null,
        rest: null,
        clock: IDLE_CLOCK,

        startMilitary: (program) => {
          cancelWorkoutAlerts();
          set({
            rest: null,
            clock: IDLE_CLOCK,
            active: {
              id: createId(),
              mode: 'military',
              title: program.name,
              sourceId: program.id,
              startedAt: Date.now(),
              timer: program.timer,
              roundsCompleted: 0,
              exercises: program.movements.map((m) => ({
                id: createId(),
                exerciseId: m.exerciseId,
                name: m.name,
                target: m.target,
                restSec: 0,
                sets: Array.from({ length: m.sets }, () => newSet()),
              })),
            },
          });
        },

        startGym: (routine) => {
          cancelWorkoutAlerts();
          set({
            rest: null,
            clock: IDLE_CLOCK,
            active: {
              id: createId(),
              mode: 'gym',
              title: routine.name,
              sourceId: routine.id,
              startedAt: Date.now(),
              roundsCompleted: 0,
              exercises: routine.exercises.map((re) => ({
                id: createId(),
                exerciseId: re.exerciseId,
                name: findExercise(re.exerciseId)?.name ?? re.exerciseId,
                target: `${re.targetSets} x ${re.targetReps}`,
                restSec: re.restSec,
                sets: Array.from({ length: re.targetSets }, () =>
                  newSet(re.targetReps),
                ),
              })),
            },
          });
        },

        toggleSet: (exerciseId, setId) => {
          const active = get().active;
          const exercise = active?.exercises.find((ex) => ex.id === exerciseId);
          const target = exercise?.sets.find((s) => s.id === setId);
          if (!active || !exercise || !target) return;

          mapExercise(exerciseId, (sets) =>
            sets.map((s) => (s.id === setId ? { ...s, completed: !s.completed } : s)),
          );
          // Descanso automático al completar una serie de gimnasio.
          if (!target.completed && active.mode === 'gym' && exercise.restSec > 0) {
            get().startRest(exercise.restSec);
          }
        },

        updateSet: (exerciseId, setId, patch) =>
          mapExercise(exerciseId, (sets) =>
            sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
          ),

        addSet: (exerciseId) =>
          mapExercise(exerciseId, (sets) => {
            const last = sets[sets.length - 1];
            return [...sets, newSet(last?.reps, last?.weightKg)];
          }),

        removeSet: (exerciseId, setId) =>
          mapExercise(exerciseId, (sets) => sets.filter((s) => s.id !== setId)),

        addRound: () =>
          set((state) =>
            state.active
              ? {
                  active: {
                    ...state.active,
                    roundsCompleted: state.active.roundsCompleted + 1,
                  },
                }
              : state,
          ),

        startRest: (durationSec) => {
          const endsAt = Date.now() + durationSec * 1000;
          set({ rest: { durationSec, endsAt } });
          scheduleRestAlert(endsAt);
        },

        extendRest: (seconds) => {
          const rest = get().rest;
          if (!rest) return;
          const endsAt = rest.endsAt + seconds * 1000;
          set({ rest: { durationSec: rest.durationSec + seconds, endsAt } });
          scheduleRestAlert(endsAt);
        },

        skipRest: () => {
          set({ rest: null });
          cancelAlerts('rest');
        },

        startTimer: () => {
          set((state) => ({ clock: startClock(state.clock) }));
          const { active, clock } = get();
          if (active?.timer) {
            const elapsedSec = clockElapsedMs(clock, Date.now()) / 1000;
            scheduleAlerts('workout-timer', pendingAlerts(active.timer, elapsedSec));
          }
        },
        pauseTimer: () => {
          set((state) => ({ clock: pauseClock(state.clock) }));
          cancelAlerts('workout-timer');
        },
        resetTimer: () => {
          set({ clock: IDLE_CLOCK });
          cancelAlerts('workout-timer');
        },

        finishWorkout: () => {
          const active = get().active;
          if (!active) return null;
          const endedAt = Date.now();
          const session: Session = {
            id: active.id,
            mode: active.mode,
            title: active.title,
            sourceId: active.sourceId,
            startedAt: active.startedAt,
            endedAt,
            durationSec: Math.round((endedAt - active.startedAt) / 1000),
            roundsCompleted: active.roundsCompleted,
            exercises: active.exercises,
          };
          useHistoryStore.getState().addSession(session);
          set({ active: null, rest: null, clock: IDLE_CLOCK });
          cancelWorkoutAlerts();
          return session;
        },

        cancelWorkout: () => {
          set({ active: null, rest: null, clock: IDLE_CLOCK });
          cancelWorkoutAlerts();
        },
      };
    },
    // Se persiste para no perder el entrenamiento si se cierra la app.
    {
      name: 'active-workout',
      storage: persistStorage,
      version: STORAGE_VERSION,
      migrate: (persisted, version) => {
        const state = persisted as Pick<WorkoutState, 'active' | 'rest' | 'clock'>;
        if (version < 1 && state.active) {
          state.active = {
            ...state.active,
            exercises: state.active.exercises.map((e) => ({
              ...e,
              exerciseId: e.exerciseId && resolveExerciseId(e.exerciseId),
            })),
          };
        }
        return state;
      },
    },
  ),
);
