import type {
  Equipment,
  Exercise,
  ExerciseCategory,
  ExerciseLevel,
  Muscle,
} from '../types';
import rawExercises from './exercises.json';

/**
 * Catálogo completo de ejercicios (876), generado por
 * scripts/build-exercises.mjs desde free-exercise-db (dominio público).
 */
export const EXERCISES = rawExercises as Exercise[];

const BY_ID = new Map(EXERCISES.map((e) => [e.id, e]));

/** IDs de la primera versión de la app, por si quedan en rutinas guardadas. */
const LEGACY_IDS: Record<string, string> = {
  'press-banca': 'Barbell_Bench_Press_-_Medium_Grip',
  'press-inclinado': 'Incline_Dumbbell_Press',
  'peso-muerto': 'Barbell_Deadlift',
  'remo-barra': 'Bent_Over_Barbell_Row',
  'jalon-pecho': 'Wide-Grip_Lat_Pulldown',
  sentadilla: 'Barbell_Squat',
  prensa: 'Leg_Press',
  'peso-muerto-rumano': 'Romanian_Deadlift',
  'press-militar': 'Standing_Military_Press',
  'elevaciones-laterales': 'Side_Lateral_Raise',
  'curl-biceps': 'Dumbbell_Bicep_Curl',
  'extension-triceps': 'Triceps_Pushdown',
  plancha: 'Plank',
};

export function findExercise(id: string): Exercise | undefined {
  return BY_ID.get(id) ?? BY_ID.get(LEGACY_IDS[id]);
}

/** Fijado al mismo commit que el script de generación. */
const IMAGE_BASE_URL =
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/f00c92c7dcf1216a928a52c3706c7ce8e2f71ed5/exercises/';

export function exerciseImageUrls(exercise: Exercise): string[] {
  return exercise.images.map((path) => IMAGE_BASE_URL + path);
}

export const MUSCLE_LABELS: Record<Muscle, string> = {
  abdominals: 'Abdominales',
  abductors: 'Abductores',
  adductors: 'Aductores',
  biceps: 'Bíceps',
  calves: 'Gemelos',
  chest: 'Pecho',
  forearms: 'Antebrazos',
  glutes: 'Glúteos',
  hamstrings: 'Isquiotibiales',
  lats: 'Dorsales',
  'lower back': 'Zona lumbar',
  'middle back': 'Espalda media',
  neck: 'Cuello',
  quadriceps: 'Cuádriceps',
  shoulders: 'Hombros',
  traps: 'Trapecio',
  triceps: 'Tríceps',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  none: 'Sin equipo',
  'body only': 'Peso corporal',
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  kettlebells: 'Kettlebell',
  cable: 'Polea',
  machine: 'Máquina',
  bands: 'Bandas',
  'medicine ball': 'Balón medicinal',
  'exercise ball': 'Fitball',
  'foam roll': 'Rodillo de espuma',
  'e-z curl bar': 'Barra Z',
  other: 'Otro',
};

export const CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: 'Fuerza',
  stretching: 'Estiramiento',
  plyometrics: 'Pliometría',
  strongman: 'Strongman',
  powerlifting: 'Powerlifting',
  cardio: 'Cardio',
  'olympic weightlifting': 'Halterofilia',
};

export const LEVEL_LABELS: Record<ExerciseLevel, string> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  expert: 'Avanzado',
};

export const FORCE_LABELS = { push: 'Empuje', pull: 'Tirón', static: 'Estático' } as const;

export const MECHANIC_LABELS = { compound: 'Multiarticular', isolation: 'Aislamiento' } as const;

/** Minúsculas y sin acentos, para buscar "biceps" y encontrar "bíceps". */
export function normalizeSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** Nombre (es/en), músculos principales y equipo: "biceps" o "polea" también encuentran. */
const SEARCH_INDEX = new Map(
  EXERCISES.map((e) => [
    e.id,
    normalizeSearch(
      [
        e.name,
        e.nameEn,
        ...e.primaryMuscles.map((m) => MUSCLE_LABELS[m]),
        EQUIPMENT_LABELS[e.equipment],
      ].join(' '),
    ),
  ]),
);

export interface ExerciseFilters {
  query: string;
  muscleGroup: Exercise['muscleGroup'] | null;
  equipment: Equipment | null;
  category: ExerciseCategory | null;
}

export function filterExercises(filters: ExerciseFilters): Exercise[] {
  const words = normalizeSearch(filters.query).split(/\s+/).filter(Boolean);
  return EXERCISES.filter(
    (e) =>
      (!filters.muscleGroup || e.muscleGroup === filters.muscleGroup) &&
      (!filters.equipment || e.equipment === filters.equipment) &&
      (!filters.category || e.category === filters.category) &&
      words.every((w) => SEARCH_INDEX.get(e.id)!.includes(w)),
  );
}
