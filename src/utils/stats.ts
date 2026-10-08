import type { Session, TrainingMode } from '../types';
import { estimateOneRepMax } from './oneRepMax';
import { isWorkingSet } from './progression';

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Lunes 00:00 de la semana actual. */
function startOfWeek(now: number): number {
  const d = new Date(startOfDay(now));
  const daysSinceMonday = (d.getDay() + 6) % 7;
  return d.getTime() - daysSinceMonday * DAY_MS;
}

/**
 * Días consecutivos con al menos una sesión. La racha sigue viva si el último
 * día activo fue hoy o ayer.
 */
export function computeStreak(sessions: Session[], now = Date.now()): number {
  const days = new Set(sessions.map((s) => startOfDay(s.endedAt)));
  let cursor = startOfDay(now);
  if (!days.has(cursor)) cursor -= DAY_MS;
  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY_MS;
  }
  return streak;
}

export function sessionVolumeKg(session: Session): number {
  return session.exercises.reduce(
    (total, ex) =>
      total +
      ex.sets
        .filter((s) => s.completed && isWorkingSet(s))
        .reduce((sum, s) => sum + s.reps * s.weightKg, 0),
    0,
  );
}

export function completedSetCount(session: Session): number {
  return session.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed && isWorkingSet(s)).length,
    0,
  );
}

export interface WeeklySummaryData {
  sessions: number;
  minutes: number;
  volumeKg: number;
  completedSets: number;
  /** Lunes..Domingo: true si hubo sesión ese día. */
  activeDays: boolean[];
}

export function weeklySummary(
  sessions: Session[],
  mode?: TrainingMode,
  now = Date.now(),
): WeeklySummaryData {
  const weekStart = startOfWeek(now);
  const thisWeek = sessions.filter(
    (s) => s.endedAt >= weekStart && (!mode || s.mode === mode),
  );
  const activeDays = Array.from({ length: 7 }, () => false);
  thisWeek.forEach((s) => {
    activeDays[Math.floor((startOfDay(s.endedAt) - weekStart) / DAY_MS)] = true;
  });
  return {
    sessions: thisWeek.length,
    minutes: Math.round(
      thisWeek.reduce((sum, s) => sum + s.durationSec, 0) / 60,
    ),
    volumeKg: Math.round(thisWeek.reduce((sum, s) => sum + sessionVolumeKg(s), 0)),
    completedSets: thisWeek.reduce((sum, s) => sum + completedSetCount(s), 0),
    activeDays,
  };
}

export interface ExerciseRecord {
  exerciseId: string;
  name: string;
  bestOneRepMaxKg: number;
  maxWeightKg: number;
}

/** Mejor 1RM estimado y peso máximo por ejercicio de gimnasio. */
export function exerciseRecords(sessions: Session[]): ExerciseRecord[] {
  const records = new Map<string, ExerciseRecord>();
  sessions
    .filter((s) => s.mode === 'gym')
    .forEach((session) =>
      session.exercises.forEach((ex) => {
        if (!ex.exerciseId) return;
        ex.sets
          .filter((set) => set.completed && isWorkingSet(set))
          .forEach((set) => {
            const prev = records.get(ex.exerciseId!) ?? {
              exerciseId: ex.exerciseId!,
              name: ex.name,
              bestOneRepMaxKg: 0,
              maxWeightKg: 0,
            };
            records.set(ex.exerciseId!, {
              ...prev,
              bestOneRepMaxKg: Math.max(
                prev.bestOneRepMaxKg,
                estimateOneRepMax(set.weightKg, set.reps),
              ),
              maxWeightKg: Math.max(prev.maxWeightKg, set.weightKg),
            });
          });
      }),
    );
  return [...records.values()].sort(
    (a, b) => b.bestOneRepMaxKg - a.bestOneRepMaxKg,
  );
}
