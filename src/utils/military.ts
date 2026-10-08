import { MILITARY_LEVELS, MILITARY_PROGRAMS } from '../data/data';
import type {
  FitnessTestResult,
  MilitaryLevel,
  MilitaryProgram,
  Session,
  Sex,
} from '../types';
import { formatDuration } from './format';
import { isWorkingSet } from './progression';

// --- Prueba física ----------------------------------------------------------

/**
 * Valores de 60 puntos (mínimo para aprobar) y 100 puntos (máximo) de las
 * tablas históricas de la APFT del ejército de EE. UU. (retirada en 2020).
 * Flexiones y abdominales en 2 minutos; carrera de 2 millas (3.2 km) en
 * segundos. Entre ambos valores se interpola de forma lineal, así que la nota
 * es una estimación: la tabla oficial no es exactamente lineal.
 */
interface EventRange {
  min: number;
  max: number;
}

interface AgeBand {
  maxAge: number;
  pushups: Record<Sex, EventRange>;
  situps: EventRange;
  run: Record<Sex, EventRange>;
}

const mmss = (m: number, s: number) => m * 60 + s;

const APFT_BANDS: AgeBand[] = [
  {
    maxAge: 21,
    pushups: { male: { min: 42, max: 71 }, female: { min: 19, max: 42 } },
    situps: { min: 53, max: 78 },
    run: { male: { min: mmss(15, 54), max: mmss(13, 0) }, female: { min: mmss(18, 54), max: mmss(15, 36) } },
  },
  {
    maxAge: 26,
    pushups: { male: { min: 40, max: 75 }, female: { min: 17, max: 46 } },
    situps: { min: 50, max: 80 },
    run: { male: { min: mmss(16, 36), max: mmss(13, 0) }, female: { min: mmss(19, 36), max: mmss(15, 36) } },
  },
  {
    maxAge: 31,
    pushups: { male: { min: 39, max: 77 }, female: { min: 17, max: 50 } },
    situps: { min: 45, max: 82 },
    run: { male: { min: mmss(17, 0), max: mmss(13, 18) }, female: { min: mmss(20, 30), max: mmss(15, 48) } },
  },
  {
    maxAge: 36,
    pushups: { male: { min: 36, max: 75 }, female: { min: 15, max: 45 } },
    situps: { min: 42, max: 76 },
    run: { male: { min: mmss(17, 42), max: mmss(13, 18) }, female: { min: mmss(21, 42), max: mmss(15, 54) } },
  },
  {
    maxAge: 41,
    pushups: { male: { min: 34, max: 73 }, female: { min: 13, max: 40 } },
    situps: { min: 38, max: 76 },
    run: { male: { min: mmss(18, 18), max: mmss(13, 36) }, female: { min: mmss(22, 42), max: mmss(17, 0) } },
  },
  {
    maxAge: 46,
    pushups: { male: { min: 30, max: 66 }, female: { min: 12, max: 37 } },
    situps: { min: 32, max: 72 },
    run: { male: { min: mmss(18, 42), max: mmss(14, 6) }, female: { min: mmss(23, 42), max: mmss(17, 24) } },
  },
  {
    maxAge: 51,
    pushups: { male: { min: 25, max: 59 }, female: { min: 10, max: 34 } },
    situps: { min: 29, max: 66 },
    run: { male: { min: mmss(19, 30), max: mmss(14, 24) }, female: { min: mmss(24, 0), max: mmss(17, 36) } },
  },
  {
    maxAge: Infinity,
    pushups: { male: { min: 20, max: 56 }, female: { min: 9, max: 31 } },
    situps: { min: 26, max: 66 },
    run: { male: { min: mmss(19, 48), max: mmss(14, 42) }, female: { min: mmss(24, 24), max: mmss(19, 0) } },
  },
];

export const PASS_SCORE = 60;

function bandFor(age: number): AgeBand {
  return APFT_BANDS.find((b) => age <= b.maxAge) ?? APFT_BANDS[APFT_BANDS.length - 1];
}

/** 60 puntos en `min`, 100 en `max`, lineal (también por debajo de 60), 0-100. */
function scoreEvent(value: number, { min, max }: EventRange): number {
  const score = PASS_SCORE + ((value - min) / (max - min)) * (100 - PASS_SCORE);
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function scoreFitnessTest(input: {
  pushups: number;
  situps: number;
  runSec: number;
  age: number;
  sex: Sex;
}): FitnessTestResult {
  const band = bandFor(input.age);
  const pushups = scoreEvent(input.pushups, band.pushups[input.sex]);
  const situps = scoreEvent(input.situps, band.situps);
  // En la carrera menos es mejor: min (60 pts) es el tiempo más lento.
  const run = input.runSec > 0 ? scoreEvent(input.runSec, band.run[input.sex]) : 0;
  return {
    ...input,
    scores: { pushups, situps, run, total: pushups + situps + run },
    passed: pushups >= PASS_SCORE && situps >= PASS_SCORE && run >= PASS_SCORE,
  };
}

/** Lo que hace falta para 60 y 100 puntos, para mostrarlo como objetivo. */
export function fitnessTestTargets(age: number, sex: Sex) {
  const band = bandFor(age);
  return {
    pushups: band.pushups[sex],
    situps: band.situps,
    run: band.run[sex],
  };
}

// --- Puntos y rangos ----------------------------------------------------------

export function findProgram(id: string): MilitaryProgram | undefined {
  return MILITARY_PROGRAMS.find((p) => p.id === id);
}

/** Rutinas militares personalizadas: 1 punto por serie completada, máximo 30. */
const CUSTOM_ROUTINE_MAX_POINTS = 30;

/**
 * Puntos de rango de una sesión militar: los del programa, prorrateados por lo
 * completado (series marcadas, rondas en AMRAP o nota en la prueba física).
 */
export function sessionPoints(session: Session): number {
  if (session.mode !== 'military') return 0;
  const program = findProgram(session.sourceId);
  if (session.fitnessTest) {
    return Math.round((program?.points ?? 30) * (session.fitnessTest.scores.total / 300));
  }
  const sets = session.exercises.flatMap((ex) => ex.sets).filter(isWorkingSet);
  const done = sets.filter((s) => s.completed).length;
  if (!program) return Math.min(CUSTOM_ROUTINE_MAX_POINTS, done);
  let completion: number;
  if (program.timer?.type === 'amrap') {
    completion = Math.min(1, session.roundsCompleted / (program.targetRounds ?? 10));
  } else {
    completion = sets.length > 0 ? done / sets.length : 0;
  }
  return Math.round(program.points * completion);
}

export interface RankProgress {
  current: MilitaryLevel;
  currentIndex: number;
  next?: MilitaryLevel;
  points: number;
  /** 0..1 hacia el siguiente rango. */
  progress: number;
}

export function rankProgress(sessions: Session[]): RankProgress {
  const points = sessions.reduce((sum, s) => sum + sessionPoints(s), 0);
  let currentIndex = 0;
  MILITARY_LEVELS.forEach((level, i) => {
    if (points >= level.minPoints) currentIndex = i;
  });
  const current = MILITARY_LEVELS[currentIndex];
  const next = MILITARY_LEVELS[currentIndex + 1];
  const progress = next
    ? (points - current.minPoints) / (next.minPoints - current.minPoints)
    : 1;
  return { current, currentIndex, next, points, progress };
}

export function levelIndex(levelId: string): number {
  return Math.max(0, MILITARY_LEVELS.findIndex((l) => l.id === levelId));
}

export function isProgramUnlocked(program: MilitaryProgram, currentRankIndex: number): boolean {
  return levelIndex(program.levelId) <= currentRankIndex;
}

// --- Marcas personales ------------------------------------------------------

/** Mejor marca del programa en texto corto, o undefined si nunca se hizo. */
export function programBest(sessions: Session[], program: MilitaryProgram): string | undefined {
  const done = sessions.filter((s) => s.mode === 'military' && s.sourceId === program.id);
  if (done.length === 0) return undefined;

  if (program.fitnessTest) {
    const best = Math.max(...done.map((s) => s.fitnessTest?.scores.total ?? 0));
    return `Mejor nota: ${best}/300`;
  }
  if (program.timer?.type === 'amrap') {
    const best = Math.max(...done.map((s) => s.roundsCompleted));
    return `Mejor: ${best} rondas`;
  }
  if (program.forTime) {
    const complete = done.filter((s) =>
      s.exercises.every((ex) => ex.sets.every((set) => set.completed)),
    );
    if (complete.length > 0) {
      return `Mejor tiempo: ${formatDuration(Math.min(...complete.map((s) => s.durationSec)))}`;
    }
  }
  return `Completado ${done.length} ${done.length === 1 ? 'vez' : 'veces'}`;
}

/** Máximo de reps registradas en una serie completada de ese ejercicio. */
export function bestReps(sessions: Session[], exerciseId: string): number {
  let best = 0;
  for (const s of sessions) {
    for (const ex of s.exercises) {
      if (ex.exerciseId !== exerciseId) continue;
      for (const set of ex.sets) if (set.completed && set.reps > best) best = set.reps;
    }
  }
  return best;
}

/** true si alguna sesión tiene `sets` series completadas con al menos `reps`. */
export function hasMastered(
  sessions: Session[],
  exerciseId: string,
  goal: { sets: number; reps: number },
): boolean {
  return sessions.some((s) =>
    s.exercises.some(
      (ex) =>
        ex.exerciseId === exerciseId &&
        ex.sets.filter((set) => set.completed && set.reps >= goal.reps).length >= goal.sets,
    ),
  );
}
