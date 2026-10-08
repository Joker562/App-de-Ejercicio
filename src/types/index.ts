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
  /** Militar = calistenia sin material de gimnasio; gimnasio = el resto. */
  mode: TrainingMode;
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
  /** Ejercicio del catálogo, para ver su animación. */
  exerciseId?: string;
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
  /** Ejercicios consecutivos con el mismo grupo forman una superserie. */
  supersetGroup?: string;
}

export interface GymRoutine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  /** Si se añadió desde una rutina precreada, su id (evita duplicarla). */
  templateId?: string;
}

/**
 * normal: serie efectiva. warmup: calentamiento (no cuenta para volumen ni
 * récords). drop: dropset. failure: llevada al fallo.
 */
export type SetType = 'normal' | 'warmup' | 'drop' | 'failure';

export interface WorkoutSet {
  id: string;
  reps: number;
  /** Siempre en kg; la conversión a lbs se hace sólo al mostrar. */
  weightKg: number;
  completed: boolean;
  /** Sin definir = normal (datos anteriores a los tipos de serie). */
  type?: SetType;
  /** Esfuerzo percibido, 6-10. */
  rpe?: number;
}

/** Serie de la sesión anterior del mismo ejercicio, para "la última vez". */
export interface PreviousSet {
  reps: number;
  weightKg: number;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  exerciseId?: string;
  target: string;
  restSec: number;
  sets: WorkoutSet[];
  /** Reps objetivo por serie (gimnasio), para sugerir progresión. */
  targetReps?: number;
  /** Series efectivas completadas la última vez que se hizo este ejercicio. */
  previous?: PreviousSet[];
  notes?: string;
  supersetGroup?: string;
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
