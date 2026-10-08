export type TrainingMode = 'military' | 'gym';

export type WeightUnit = 'kg' | 'lbs';

export type MuscleGroup =
  | 'Pecho'
  | 'Espalda'
  | 'Piernas'
  | 'Hombros'
  | 'Brazos'
  | 'Core';

/** Músculos tal como vienen en free-exercise-db (las etiquetas en español están en exercises.ts). */
export type Muscle =
  | 'abdominals'
  | 'abductors'
  | 'adductors'
  | 'biceps'
  | 'calves'
  | 'chest'
  | 'forearms'
  | 'glutes'
  | 'hamstrings'
  | 'lats'
  | 'lower back'
  | 'middle back'
  | 'neck'
  | 'quadriceps'
  | 'shoulders'
  | 'traps'
  | 'triceps';

export type Equipment =
  | 'none'
  | 'body only'
  | 'barbell'
  | 'dumbbell'
  | 'kettlebells'
  | 'cable'
  | 'machine'
  | 'bands'
  | 'medicine ball'
  | 'exercise ball'
  | 'foam roll'
  | 'e-z curl bar'
  | 'other';

export type ExerciseCategory =
  | 'strength'
  | 'stretching'
  | 'plyometrics'
  | 'strongman'
  | 'powerlifting'
  | 'cardio'
  | 'olympic weightlifting';

export type ExerciseLevel = 'beginner' | 'intermediate' | 'expert';

export interface Exercise {
  id: string;
  /** Nombre en español. */
  name: string;
  /** Nombre original en inglés (también sirve para buscar). */
  nameEn: string;
  muscleGroup: MuscleGroup;
  primaryMuscles: Muscle[];
  secondaryMuscles: Muscle[];
  equipment: Equipment;
  category: ExerciseCategory;
  level: ExerciseLevel;
  force: 'push' | 'pull' | 'static' | null;
  mechanic: 'compound' | 'isolation' | null;
  /** Pasos en inglés, tal como vienen en la base. */
  instructions: string[];
  /** Rutas relativas: posición inicial y final del movimiento. */
  images: string[];
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
