import type {
  GymRoutine,
  MilitaryLevel,
  MilitaryProgram,
  MuscleGroup,
} from '../types';

export const MILITARY_LEVELS: MilitaryLevel[] = [
  { id: 'recluta', name: 'Recluta', minSessions: 0 },
  { id: 'soldado', name: 'Soldado', minSessions: 5 },
  { id: 'cabo', name: 'Cabo', minSessions: 15 },
  { id: 'sargento', name: 'Sargento', minSessions: 30 },
  { id: 'ranger', name: 'Ranger', minSessions: 50 },
  { id: 'fuerzas-especiales', name: 'Fuerzas Especiales', minSessions: 80 },
];

export const MILITARY_PROGRAMS: MilitaryProgram[] = [
  {
    id: 'apft',
    name: 'Prueba de Condición Física',
    description:
      'Basada en la APFT del ejército: máximas flexiones y abdominales en 2 minutos y carrera de 3.2 km.',
    levelId: 'recluta',
    movements: [
      { name: 'Flexiones', target: 'Máx. en 2 min', sets: 1 },
      { name: 'Abdominales', target: 'Máx. en 2 min', sets: 1 },
      { name: 'Carrera', target: '3.2 km', sets: 1 },
    ],
  },
  {
    id: 'cindy',
    name: 'Cindy (AMRAP 20)',
    description:
      'Tantas rondas como sea posible en 20 minutos. Clásico de resistencia con peso corporal.',
    levelId: 'soldado',
    movements: [
      { name: 'Dominadas', target: '5 reps', sets: 0 },
      { name: 'Flexiones', target: '10 reps', sets: 0 },
      { name: 'Sentadillas', target: '15 reps', sets: 0 },
    ],
    timer: { type: 'amrap', durationSec: 20 * 60 },
  },
  {
    id: 'emom-dominadas',
    name: 'EMOM Dominadas',
    description:
      'Al inicio de cada minuto: dominadas y flexiones. Descansa el resto del minuto.',
    levelId: 'cabo',
    movements: [
      { name: 'Dominadas', target: '5 reps por minuto', sets: 12 },
      { name: 'Flexiones', target: '10 reps por minuto', sets: 12 },
    ],
    timer: { type: 'emom', minutes: 12 },
  },
  {
    id: 'tabata-burpees',
    name: 'Tabata Burpees',
    description: '8 rondas de 20 s de trabajo máximo y 10 s de descanso.',
    levelId: 'recluta',
    movements: [{ name: 'Burpees', target: '20 s al máximo', sets: 8 }],
    timer: { type: 'tabata', workSec: 20, restSec: 10, rounds: 8 },
  },
  {
    id: 'murph',
    name: 'Murph',
    description:
      'Homenaje militar: 1.6 km de carrera, 100 dominadas, 200 flexiones, 300 sentadillas y 1.6 km de carrera, particionado en 20 rondas de 5/10/15.',
    levelId: 'ranger',
    movements: [
      { name: 'Carrera inicial', target: '1.6 km', sets: 1 },
      { name: 'Dominadas', target: '5 reps por ronda', sets: 20 },
      { name: 'Flexiones', target: '10 reps por ronda', sets: 20 },
      { name: 'Sentadillas', target: '15 reps por ronda', sets: 20 },
      { name: 'Carrera final', target: '1.6 km', sets: 1 },
    ],
  },
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core',
];

// El catálogo completo de ejercicios vive en ./exercises.ts.
export { findExercise } from './exercises';

export const DEFAULT_GYM_ROUTINES: GymRoutine[] = [
  {
    id: 'push',
    name: 'Push (Empuje)',
    exercises: [
      { exerciseId: 'Barbell_Bench_Press_-_Medium_Grip', targetSets: 4, targetReps: 8, restSec: 120 },
      { exerciseId: 'Standing_Military_Press', targetSets: 3, targetReps: 8, restSec: 90 },
      { exerciseId: 'Incline_Dumbbell_Press', targetSets: 3, targetReps: 10, restSec: 90 },
      { exerciseId: 'Side_Lateral_Raise', targetSets: 3, targetReps: 12, restSec: 60 },
      { exerciseId: 'Triceps_Pushdown', targetSets: 3, targetReps: 12, restSec: 60 },
    ],
  },
  {
    id: 'pull',
    name: 'Pull (Tirón)',
    exercises: [
      { exerciseId: 'Barbell_Deadlift', targetSets: 3, targetReps: 5, restSec: 180 },
      { exerciseId: 'Pullups', targetSets: 4, targetReps: 8, restSec: 120 },
      { exerciseId: 'Bent_Over_Barbell_Row', targetSets: 3, targetReps: 8, restSec: 90 },
      { exerciseId: 'Face_Pull', targetSets: 3, targetReps: 15, restSec: 60 },
      { exerciseId: 'Dumbbell_Bicep_Curl', targetSets: 3, targetReps: 12, restSec: 60 },
    ],
  },
  {
    id: 'legs',
    name: 'Legs (Pierna)',
    exercises: [
      { exerciseId: 'Barbell_Squat', targetSets: 4, targetReps: 6, restSec: 180 },
      { exerciseId: 'Romanian_Deadlift', targetSets: 3, targetReps: 8, restSec: 120 },
      { exerciseId: 'Leg_Press', targetSets: 3, targetReps: 12, restSec: 90 },
      { exerciseId: 'Lying_Leg_Curls', targetSets: 3, targetReps: 12, restSec: 60 },
      { exerciseId: 'Standing_Calf_Raises', targetSets: 4, targetReps: 15, restSec: 60 },
    ],
  },
  {
    id: 'full-body',
    name: 'Full Body',
    exercises: [
      { exerciseId: 'Barbell_Squat', targetSets: 3, targetReps: 8, restSec: 120 },
      { exerciseId: 'Dumbbell_Bench_Press', targetSets: 3, targetReps: 10, restSec: 90 },
      { exerciseId: 'Seated_Cable_Rows', targetSets: 3, targetReps: 10, restSec: 90 },
      { exerciseId: 'Dumbbell_Shoulder_Press', targetSets: 3, targetReps: 10, restSec: 90 },
      { exerciseId: 'Plank', targetSets: 3, targetReps: 1, restSec: 60 },
    ],
  },
];
