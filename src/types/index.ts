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
  /** Puntos militares acumulados necesarios para alcanzar el rango. */
  minPoints: number;
}

export type Sex = 'male' | 'female';

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
  /** Qué se registra en cada serie además del check. Por defecto, reps. */
  measure?: 'reps' | 'time';
}

export interface MilitaryProgram {
  id: string;
  name: string;
  description: string;
  /** Rango mínimo para desbloquearlo. */
  levelId: string;
  movements: MilitaryMovement[];
  timer?: TimerConfig;
  /** Puntos de rango por completarlo entero (se prorratea si se hace a medias). */
  points: number;
  /** AMRAP: rondas que cuentan como "completado" para los puntos. */
  targetRounds?: number;
  /** Se compite por tiempo (p. ej. Murph): la marca es el tiempo más bajo. */
  forTime?: boolean;
  /** Abre la pantalla de la prueba física en lugar del entrenamiento genérico. */
  fitnessTest?: boolean;
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
  /** Rutina personalizada de calistenia militar. Sin definir = gimnasio. */
  mode?: TrainingMode;
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
  /** Tiempo registrado (p. ej. carrera), en segundos. */
  durationSec?: number;
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
  /** Militar: qué se registra por serie. */
  measure?: 'reps' | 'time';
}

/** Resultado de la prueba física (estimación basada en la APFT). */
export interface FitnessTestResult {
  pushups: number;
  situps: number;
  runSec: number;
  age: number;
  sex: Sex;
  scores: { pushups: number; situps: number; run: number; total: number };
  passed: boolean;
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
  fitnessTest?: FitnessTestResult;
  /** Récords batidos en esta sesión (se calculan al guardarla). */
  records?: RecordBreak[];
}

export type RecordKind = 'weight' | 'e1rm' | 'reps' | 'rounds' | 'time' | 'score';

/** Un récord personal batido, con el valor nuevo y el anterior. */
export interface RecordBreak {
  kind: RecordKind;
  /** Ejercicio o programa al que pertenece. */
  subject: string;
  exerciseId?: string;
  /** Valores numéricos en unidades base (kg, reps, rondas, segundos, puntos). */
  value: number;
  previous: number;
}

/** Registro de peso corporal y medidas (cm). */
export interface BodyEntry {
  id: string;
  date: number;
  weightKg?: number;
  bodyFatPct?: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  thighCm?: number;
}
