import type {
  GymRoutine,
  MilitaryLevel,
  MilitaryProgram,
  MuscleGroup,
} from '../types';
import { ROUTINE_PROGRAMS } from './routineTemplates';

export const MILITARY_LEVELS: MilitaryLevel[] = [
  { id: 'recluta', name: 'Recluta', minPoints: 0 },
  { id: 'soldado', name: 'Soldado', minPoints: 100 },
  { id: 'cabo', name: 'Cabo', minPoints: 300 },
  { id: 'sargento', name: 'Sargento', minPoints: 700 },
  { id: 'ranger', name: 'Ranger', minPoints: 1200 },
  { id: 'fuerzas-especiales', name: 'Fuerzas Especiales', minPoints: 2000 },
];

export const MILITARY_PROGRAMS: MilitaryProgram[] = [
  {
    id: 'apft',
    name: 'Prueba de Condición Física',
    description:
      'Basada en la APFT del ejército: máximas flexiones y abdominales en 2 minutos y carrera de 3.2 km.',
    levelId: 'recluta',
    points: 30,
    fitnessTest: true,
    movements: [
      { name: 'Flexiones', target: 'Máx. en 2 min', sets: 1, exerciseId: 'Pushups' },
      { name: 'Abdominales', target: 'Máx. en 2 min', sets: 1, exerciseId: 'Sit-Up' },
      { name: 'Carrera', target: '3.2 km', sets: 1, measure: 'time' },
    ],
  },
  {
    id: 'cindy',
    name: 'Cindy (AMRAP 20)',
    description:
      'Tantas rondas como sea posible en 20 minutos. Clásico de resistencia con peso corporal.',
    levelId: 'soldado',
    points: 25,
    targetRounds: 15,
    movements: [
      { name: 'Dominadas', target: '5 reps', sets: 0, exerciseId: 'Pullups' },
      { name: 'Flexiones', target: '10 reps', sets: 0, exerciseId: 'Pushups' },
      { name: 'Sentadillas', target: '15 reps', sets: 0, exerciseId: 'Bodyweight_Squat' },
    ],
    timer: { type: 'amrap', durationSec: 20 * 60 },
  },
  {
    id: 'emom-dominadas',
    name: 'EMOM Dominadas',
    description:
      'Al inicio de cada minuto: dominadas y flexiones. Descansa el resto del minuto.',
    levelId: 'cabo',
    points: 20,
    movements: [
      { name: 'Dominadas', target: '5 reps por minuto', sets: 12, exerciseId: 'Pullups' },
      { name: 'Flexiones', target: '10 reps por minuto', sets: 12, exerciseId: 'Pushups' },
    ],
    timer: { type: 'emom', minutes: 12 },
  },
  {
    id: 'tabata-burpees',
    name: 'Tabata Burpees',
    description: '8 rondas de 20 s de trabajo máximo y 10 s de descanso.',
    levelId: 'recluta',
    points: 10,
    movements: [{ name: 'Burpees', target: '20 s al máximo', sets: 8 }],
    timer: { type: 'tabata', workSec: 20, restSec: 10, rounds: 8 },
  },
  {
    id: 'murph',
    name: 'Murph',
    description:
      'Homenaje militar: 1.6 km de carrera, 100 dominadas, 200 flexiones, 300 sentadillas y 1.6 km de carrera, particionado en 20 rondas de 5/10/15.',
    levelId: 'ranger',
    points: 60,
    forTime: true,
    movements: [
      { name: 'Carrera inicial', target: '1.6 km', sets: 1, measure: 'time' },
      { name: 'Dominadas', target: '5 reps por ronda', sets: 20, exerciseId: 'Pullups' },
      { name: 'Flexiones', target: '10 reps por ronda', sets: 20, exerciseId: 'Pushups' },
      { name: 'Sentadillas', target: '15 reps por ronda', sets: 20, exerciseId: 'Bodyweight_Squat' },
      { name: 'Carrera final', target: '1.6 km', sets: 1, measure: 'time' },
    ],
  },
  {
    id: 'calistenia-basica',
    name: 'Calistenia básica',
    description:
      'Los cinco básicos con peso corporal para construir la base. Descansa 60-90 s entre series.',
    levelId: 'recluta',
    points: 10,
    movements: [
      { name: 'Flexiones', target: '10-15 reps', sets: 3, exerciseId: 'Pushups' },
      { name: 'Sentadillas', target: '20 reps', sets: 3, exerciseId: 'Bodyweight_Squat' },
      { name: 'Remo invertido', target: '8-12 reps', sets: 3, exerciseId: 'Inverted_Row' },
      { name: 'Abdominales', target: '15 reps', sets: 3, exerciseId: 'Sit-Up' },
      { name: 'Plancha', target: '30-60 s', sets: 3, exerciseId: 'Plank', measure: 'time' },
    ],
  },
  {
    id: 'movilidad',
    name: 'Movilidad y estiramientos',
    description: 'Sesión suave para recuperar entre días duros o como vuelta a la calma.',
    levelId: 'recluta',
    points: 5,
    movements: [
      { name: 'El mejor estiramiento del mundo', target: '5 por lado', sets: 2, exerciseId: 'Worlds_Greatest_Stretch' },
      { name: 'Estiramiento del gato', target: '30 s', sets: 2, exerciseId: 'Cat_Stretch' },
      { name: 'Postura del niño', target: '30 s', sets: 2, exerciseId: 'Childs_Pose' },
      { name: 'Estiramiento del corredor', target: '30 s por lado', sets: 2, exerciseId: 'Runners_Stretch' },
      { name: 'Estiramiento de isquiotibiales', target: '30 s por lado', sets: 2, exerciseId: 'Hamstring_Stretch' },
    ],
  },
  {
    id: 'circuito-resistencia',
    name: 'Circuito de resistencia (AMRAP 15)',
    description: 'Tantas rondas como puedas en 15 minutos, sin material.',
    levelId: 'soldado',
    points: 15,
    targetRounds: 10,
    movements: [
      { name: 'Escaladores', target: '20 reps', sets: 0, exerciseId: 'Mountain_Climbers' },
      { name: 'Flexiones', target: '15 reps', sets: 0, exerciseId: 'Pushups' },
      { name: 'Zancadas caminando', target: '20 pasos', sets: 0, exerciseId: 'Bodyweight_Walking_Lunge' },
      { name: 'Abdominales', target: '15 reps', sets: 0, exerciseId: 'Sit-Up' },
    ],
    timer: { type: 'amrap', durationSec: 15 * 60 },
  },
  {
    id: 'pliometria-combate',
    name: 'Pliometría de combate',
    description: 'Potencia y explosividad. Máxima intensidad en cada repetición, descanso completo.',
    levelId: 'cabo',
    points: 20,
    movements: [
      { name: 'Sentadilla con salto', target: '10 reps', sets: 4, exerciseId: 'Freehand_Jump_Squat' },
      { name: 'Salto con rodillas al pecho', target: '8 reps', sets: 4, exerciseId: 'Knee_Tuck_Jump' },
      { name: 'Flexiones pliométricas', target: '8 reps', sets: 4, exerciseId: 'Plyo_Push-up' },
      { name: 'Saltos laterales', target: '10 por lado', sets: 4, exerciseId: 'Lateral_Bound' },
    ],
  },
  {
    id: 'barra-paralelas',
    name: 'Barra y paralelas',
    description: 'Fuerza del tren superior con tu peso: dominadas, fondos y core colgado.',
    levelId: 'sargento',
    points: 25,
    movements: [
      { name: 'Dominadas', target: 'Máx. reps', sets: 5, exerciseId: 'Pullups' },
      { name: 'Fondos en paralelas', target: 'Máx. reps', sets: 5, exerciseId: 'Parallel_Bar_Dip' },
      { name: 'Elevación de piernas colgado', target: '10-15 reps', sets: 4, exerciseId: 'Hanging_Leg_Raise' },
      { name: 'Dominadas supinas', target: 'Máx. reps', sets: 3, exerciseId: 'Chin-Up' },
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

/** Rutinas iniciales: el programa PPL y el Full Body de las rutinas precreadas. */
export const DEFAULT_GYM_ROUTINES: GymRoutine[] = ROUTINE_PROGRAMS.filter((p) =>
  ['ppl', 'full-body-principiante'].includes(p.id),
).flatMap((p) => p.routines.map((r) => ({ ...r, templateId: r.id })));
