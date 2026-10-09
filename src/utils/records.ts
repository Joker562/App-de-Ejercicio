import type { MuscleGroup, RecordBreak, Session, TrainingMode, WeightUnit } from '../types';
import { findExercise } from '../data/exercises';
import { formatDuration, kgToUnit } from './format';
import { findProgram } from './military';
import { estimateOneRepMax } from './oneRepMax';
import { isWorkingSet } from './progression';

// --- Historial por ejercicio ---------------------------------------------------

export interface ExercisePoint {
  sessionId: string;
  date: number;
  /** Mejor 1RM estimado de la sesión (kg). */
  bestE1rmKg: number;
  maxWeightKg: number;
  /** Más reps en una serie completada. */
  bestReps: number;
  /** Series efectivas completadas. */
  sets: number;
  /** Volumen (kg) de las series efectivas completadas. */
  volumeKg: number;
}

/** Una entrada por sesión en la que se completó el ejercicio, de antigua a reciente. */
export function exerciseHistory(sessions: Session[], exerciseId: string): ExercisePoint[] {
  const points: ExercisePoint[] = [];
  for (const session of sessions) {
    const sets = session.exercises
      .filter((ex) => ex.exerciseId === exerciseId)
      .flatMap((ex) => ex.sets)
      .filter((s) => s.completed && isWorkingSet(s));
    if (sets.length === 0) continue;
    points.push({
      sessionId: session.id,
      date: session.endedAt,
      bestE1rmKg: Math.max(...sets.map((s) => estimateOneRepMax(s.weightKg, s.reps))),
      maxWeightKg: Math.max(...sets.map((s) => s.weightKg)),
      bestReps: Math.max(...sets.map((s) => s.reps)),
      sets: sets.length,
      volumeKg: sets.reduce((sum, s) => sum + s.reps * s.weightKg, 0),
    });
  }
  return points.sort((a, b) => a.date - b.date);
}

/** Ejercicios con historial (para listar "tu progreso"), por número de sesiones. */
export function trainedExercises(sessions: Session[], mode: TrainingMode) {
  const counts = new Map<string, { name: string; sessions: number; last: number }>();
  for (const session of sessions) {
    if (session.mode !== mode) continue;
    const seen = new Set<string>();
    for (const ex of session.exercises) {
      if (!ex.exerciseId || seen.has(ex.exerciseId)) continue;
      if (!ex.sets.some((s) => s.completed && isWorkingSet(s))) continue;
      seen.add(ex.exerciseId);
      const entry = counts.get(ex.exerciseId) ?? { name: ex.name, sessions: 0, last: 0 };
      entry.sessions += 1;
      entry.last = Math.max(entry.last, session.endedAt);
      counts.set(ex.exerciseId, entry);
    }
  }
  return [...counts.entries()]
    .map(([exerciseId, info]) => ({ exerciseId, ...info }))
    .sort((a, b) => b.sessions - a.sessions || b.last - a.last);
}

// --- Récords ------------------------------------------------------------------

/**
 * Récords que `session` bate frente a `previous` (el historial sin ella).
 * Sólo cuenta como récord superar una marca anterior: la primera vez que se
 * hace algo no es récord.
 */
export function detectRecords(session: Session, previous: Session[]): RecordBreak[] {
  const records: RecordBreak[] = [];

  const exerciseIds = new Set(
    session.exercises.map((ex) => ex.exerciseId).filter((id): id is string => !!id),
  );
  for (const exerciseId of exerciseIds) {
    const now = exerciseHistory([session], exerciseId)[0];
    const before = exerciseHistory(previous, exerciseId);
    if (!now || before.length === 0) continue;
    const name = findExercise(exerciseId)?.name ?? exerciseId;
    const prevWeight = Math.max(...before.map((p) => p.maxWeightKg));
    const prevE1rm = Math.max(...before.map((p) => p.bestE1rmKg));
    const prevReps = Math.max(...before.map((p) => p.bestReps));

    if (session.mode === 'gym' && now.maxWeightKg > 0) {
      if (now.maxWeightKg > prevWeight + 0.01) {
        records.push({ kind: 'weight', subject: name, exerciseId, value: now.maxWeightKg, previous: prevWeight });
      } else if (now.bestE1rmKg > prevE1rm + 0.01) {
        records.push({ kind: 'e1rm', subject: name, exerciseId, value: now.bestE1rmKg, previous: prevE1rm });
      }
    } else if (now.bestReps > prevReps && prevReps > 0) {
      records.push({ kind: 'reps', subject: name, exerciseId, value: now.bestReps, previous: prevReps });
    }
  }

  // Marcas de programa militar.
  const program = findProgram(session.sourceId);
  const samePrograms = previous.filter((s) => s.mode === 'military' && s.sourceId === session.sourceId);
  if (program && samePrograms.length > 0) {
    if (session.fitnessTest) {
      const best = Math.max(...samePrograms.map((s) => s.fitnessTest?.scores.total ?? 0));
      if (session.fitnessTest.scores.total > best) {
        records.push({ kind: 'score', subject: program.name, value: session.fitnessTest.scores.total, previous: best });
      }
    } else if (program.timer?.type === 'amrap') {
      const best = Math.max(...samePrograms.map((s) => s.roundsCompleted));
      if (session.roundsCompleted > best && best > 0) {
        records.push({ kind: 'rounds', subject: program.name, value: session.roundsCompleted, previous: best });
      }
    } else if (program.forTime) {
      const complete = (s: Session) => s.exercises.every((ex) => ex.sets.every((set) => set.completed));
      const times = samePrograms.filter(complete).map((s) => s.durationSec);
      if (complete(session) && times.length > 0 && session.durationSec < Math.min(...times)) {
        records.push({ kind: 'time', subject: program.name, value: session.durationSec, previous: Math.min(...times) });
      }
    }
  }

  return records;
}

const RECORD_LABELS: Record<RecordBreak['kind'], string> = {
  weight: 'Peso máximo',
  e1rm: '1RM estimado',
  reps: 'Más repeticiones',
  rounds: 'Más rondas',
  time: 'Mejor tiempo',
  score: 'Mejor nota',
};

/** "Peso máximo: 85 kg (antes 80 kg)". */
export function describeRecord(record: RecordBreak, unit: WeightUnit): { title: string; detail: string } {
  const format = (v: number) => {
    switch (record.kind) {
      case 'weight':
      case 'e1rm':
        return `${kgToUnit(v, unit)} ${unit}`;
      case 'time':
        return formatDuration(v);
      case 'score':
        return `${v}/300`;
      default:
        return String(v);
    }
  };
  return {
    title: `${RECORD_LABELS[record.kind]} · ${record.subject}`,
    detail: `${format(record.value)} (antes ${format(record.previous)})`,
  };
}

// --- Volumen por grupo muscular --------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(timestamp: number): number {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Series efectivas completadas por grupo muscular en los últimos `days` días. */
export function setsByMuscleGroup(
  sessions: Session[],
  mode: TrainingMode,
  days = 7,
  now = Date.now(),
): Record<MuscleGroup, number> {
  const since = startOfDay(now) - (days - 1) * DAY_MS;
  const totals: Record<MuscleGroup, number> = {
    Pecho: 0,
    Espalda: 0,
    Piernas: 0,
    Hombros: 0,
    Brazos: 0,
    Core: 0,
    Cuello: 0,
  };
  for (const session of sessions) {
    if (session.mode !== mode || session.endedAt < since) continue;
    for (const ex of session.exercises) {
      const group = ex.exerciseId ? findExercise(ex.exerciseId)?.muscleGroup : undefined;
      if (!group) continue;
      totals[group] += ex.sets.filter((s) => s.completed && isWorkingSet(s)).length;
    }
  }
  return totals;
}

// --- Actividad por día -----------------------------------------------------------

/** Sesiones por día (clave: inicio del día) para el mapa de calor. */
export function sessionsPerDay(sessions: Session[]): Map<number, Session[]> {
  const days = new Map<number, Session[]>();
  for (const session of sessions) {
    const day = startOfDay(session.endedAt);
    days.set(day, [...(days.get(day) ?? []), session]);
  }
  return days;
}

export { startOfDay, DAY_MS };
