export type TrainingMode = 'military' | 'gym';

export type WeightUnit = 'kg' | 'lbs';

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Brazos'
  | 'Core';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: string;
}

export interface MilitaryLevel {
  id: string;
  name: string;
  /** Sesiones militares completadas necesarias para alcanzar el nivel. */
  minSessions: number;
}

export type TimerConfig =
  | { type: 'amrap'; durationSec: number }
  | { type: 'emom'; minutes: number }
  | { type: 'tabata'; workSec: number; restSec: number; rounds: number };

export type TimerType = TimerConfig['type'];

export interface MilitaryMovement {
  name: string;
  /** Texto del objetivo, p. ej. "5 reps" o "1.6 km". */
  target: string;
  /** Checkboxes a marcar. 0 en AMRAP, donde se cuentan rondas. */
  sets: number;
}

export interface MilitaryProgram {
  id: string;
  name: string;
  description: string;
  levelId: string;
  movements: MilitaryMovement[];
  timer?: TimerConfig;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets: number;
  targetReps: number;
  restSec: number;
}

export interface GymRoutine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
}

export interface WorkoutSet {
  id: string;
  reps: number;
  /** Siempre en kg; la conversión a lbs se hace sólo al mostrar. */
  weightKg: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  exerciseId?: string;
  target: string;
  restSec: number;
  sets: WorkoutSet[];
}

export interface ActiveWorkout {
  id: string;
  mode: TrainingMode;
  title: string;
  sourceId: string;
  startedAt: number;
  timer?: TimerConfig;
  /** Rondas contadas en AMRAP. */
  roundsCompleted: number;
  exercises: WorkoutExercise[];
}

export interface Session {
  id: string;
  mode: TrainingMode;
  title: string;
  sourceId: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  roundsCompleted: number;
  exercises: WorkoutExercise[];
}
