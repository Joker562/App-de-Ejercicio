import type { Exercise, PreviousSet, Session, WeightUnit, WorkoutSet } from '../types';
import { kgToUnit, unitToKg } from './format';

/** Serie efectiva = cualquiera menos calentamiento. */
export function isWorkingSet(set: WorkoutSet): boolean {
  return (set.type ?? 'normal') !== 'warmup';
}

/**
 * Series efectivas completadas la última vez que se hizo el ejercicio.
 * `sessions` va de más reciente a más antigua.
 */
export function lastPerformance(sessions: Session[], exerciseId: string): PreviousSet[] | undefined {
  for (const session of sessions) {
    if (session.mode !== 'gym') continue;
    for (const ex of session.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      const done = ex.sets.filter((s) => s.completed && isWorkingSet(s));
      if (done.length > 0) return done.map((s) => ({ reps: s.reps, weightKg: s.weightKg }));
    }
  }
  return undefined;
}

export type ProgressionAdvice =
  | { kind: 'increase'; weightKg: number; fromKg: number }
  | { kind: 'repeat'; weightKg: number };

/** Incremento según el tipo de ejercicio, en la unidad del usuario. */
function incrementFor(exercise: Exercise | undefined, unit: WeightUnit): number {
  const isolation = exercise?.mechanic === 'isolation';
  const lowerBody = exercise?.muscleGroup === 'Piernas';
  if (isolation) return unit === 'kg' ? 1 : 2.5;
  if (lowerBody) return unit === 'kg' ? 5 : 10;
  return unit === 'kg' ? 2.5 : 5;
}

/**
 * Doble progresión simple: si la última vez completaste todas las series
 * con las reps objetivo, sube el peso; si no, repite el mismo peso.
 */
export function suggestProgression(params: {
  previous: PreviousSet[] | undefined;
  targetSets: number;
  targetReps: number | undefined;
  exercise: Exercise | undefined;
  unit: WeightUnit;
}): ProgressionAdvice | null {
  const { previous, targetSets, targetReps, exercise, unit } = params;
  if (!previous?.length || !targetReps) return null;
  const topKg = Math.max(...previous.map((s) => s.weightKg));
  if (topKg <= 0) return null; // peso corporal: no hay peso que subir
  const completedAll =
    previous.length >= targetSets && previous.every((s) => s.reps >= targetReps);
  if (!completedAll) return { kind: 'repeat', weightKg: topKg };
  const next = kgToUnit(topKg, unit) + incrementFor(exercise, unit);
  return { kind: 'increase', weightKg: unitToKg(next, unit), fromKg: topKg };
}

// --- Discos y calentamiento (todo en la unidad del usuario) -----------------

export const BAR_OPTIONS: Record<WeightUnit, number[]> = {
  kg: [20, 15, 10],
  lbs: [45, 35, 25],
};

export const PLATE_OPTIONS: Record<WeightUnit, number[]> = {
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
  lbs: [45, 35, 25, 10, 5, 2.5],
};

/** Disco más pequeño por lado * 2: el salto mínimo de carga posible. */
const LOAD_STEP: Record<WeightUnit, number> = { kg: 2.5, lbs: 5 };

export interface PlateLoad {
  /** Discos por lado, de mayor a menor. */
  perSide: number[];
  /** Peso que no se puede cargar con los discos disponibles (total). */
  remainder: number;
  /** Peso total realmente cargado. */
  loaded: number;
}

export function platesFor(target: number, bar: number, plates: number[]): PlateLoad {
  if (target <= bar) return { perSide: [], remainder: 0, loaded: bar };
  let perSideLeft = (target - bar) / 2;
  const perSide: number[] = [];
  for (const plate of [...plates].sort((a, b) => b - a)) {
    while (perSideLeft >= plate - 1e-9) {
      perSide.push(plate);
      perSideLeft -= plate;
    }
  }
  const loaded = bar + perSide.reduce((sum, p) => sum + p, 0) * 2;
  return { perSide, remainder: Math.round((target - loaded) * 100) / 100, loaded };
}

/** Esquema de calentamiento clásico: barra x10, 40% x5, 60% x3, 80% x2. */
const WARMUP_SCHEME = [
  { pct: 0, reps: 10 },
  { pct: 0.4, reps: 5 },
  { pct: 0.6, reps: 3 },
  { pct: 0.8, reps: 2 },
];

export interface WarmupStep {
  reps: number;
  /** En la unidad del usuario. */
  weight: number;
}

export function warmupFor(working: number, bar: number, unit: WeightUnit): WarmupStep[] {
  if (working <= bar) return [];
  const step = LOAD_STEP[unit];
  const steps: WarmupStep[] = [];
  for (const { pct, reps } of WARMUP_SCHEME) {
    const weight = Math.max(bar, Math.round((working * pct) / step) * step);
    if (weight >= working) break;
    if (steps.length > 0 && steps[steps.length - 1].weight === weight) continue;
    steps.push({ reps, weight });
  }
  return steps;
}
