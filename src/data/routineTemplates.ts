import type { GymRoutine, RoutineExercise } from '../types';

/** Programa precreado: un conjunto de rutinas pensadas para usarse juntas. */
export interface RoutineProgram {
  id: string;
  name: string;
  description: string;
  level: 'Principiante' | 'Intermedio' | 'Todos los niveles';
  daysPerWeek: string;
  routines: GymRoutine[];
}

function ex(exerciseId: string, targetSets: number, targetReps: number, restSec: number): RoutineExercise {
  return { exerciseId, targetSets, targetReps, restSec };
}

export const ROUTINE_PROGRAMS: RoutineProgram[] = [
  {
    id: 'full-body-principiante',
    name: 'Full Body principiante',
    description: 'Todo el cuerpo en cada sesión, alternando A y B. Ideal para empezar.',
    level: 'Principiante',
    daysPerWeek: '3 días',
    routines: [
      {
        id: 'fb-a',
        name: 'Full Body A',
        exercises: [
          ex('Barbell_Squat', 3, 8, 120),
          ex('Dumbbell_Bench_Press', 3, 10, 90),
          ex('Seated_Cable_Rows', 3, 10, 90),
          ex('Dumbbell_Shoulder_Press', 3, 10, 90),
          ex('Cable_Crunch', 3, 12, 60),
        ],
      },
      {
        id: 'fb-b',
        name: 'Full Body B',
        exercises: [
          ex('Barbell_Deadlift', 3, 5, 180),
          ex('Incline_Dumbbell_Press', 3, 10, 90),
          ex('Wide-Grip_Lat_Pulldown', 3, 10, 90),
          ex('Leg_Press', 3, 12, 90),
          ex('Dumbbell_Bicep_Curl', 2, 12, 60),
          ex('Triceps_Pushdown', 2, 12, 60),
        ],
      },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    description: 'Empuje, tirón y pierna. Haz el ciclo una o dos veces por semana.',
    level: 'Intermedio',
    daysPerWeek: '3 o 6 días',
    routines: [
      {
        id: 'ppl-push',
        name: 'Push (Empuje)',
        exercises: [
          ex('Barbell_Bench_Press_-_Medium_Grip', 4, 8, 120),
          ex('Standing_Military_Press', 3, 8, 90),
          ex('Incline_Dumbbell_Press', 3, 10, 90),
          ex('Side_Lateral_Raise', 3, 15, 60),
          ex('Triceps_Pushdown_-_Rope_Attachment', 3, 12, 60),
        ],
      },
      {
        id: 'ppl-pull',
        name: 'Pull (Tirón)',
        exercises: [
          ex('Barbell_Deadlift', 3, 5, 180),
          ex('Wide-Grip_Lat_Pulldown', 4, 10, 90),
          ex('Bent_Over_Barbell_Row', 3, 8, 90),
          ex('Face_Pull', 3, 15, 60),
          ex('Barbell_Curl', 3, 10, 60),
        ],
      },
      {
        id: 'ppl-legs',
        name: 'Legs (Pierna)',
        exercises: [
          ex('Barbell_Squat', 4, 6, 180),
          ex('Romanian_Deadlift', 3, 8, 120),
          ex('Leg_Press', 3, 12, 90),
          ex('Lying_Leg_Curls', 3, 12, 60),
          ex('Standing_Calf_Raises', 4, 15, 60),
        ],
      },
    ],
  },
  {
    id: 'torso-pierna',
    name: 'Torso / Pierna',
    description: 'Cuatro sesiones: dos de torso y dos de pierna, con más volumen por grupo.',
    level: 'Intermedio',
    daysPerWeek: '4 días',
    routines: [
      {
        id: 'tp-torso-a',
        name: 'Torso A',
        exercises: [
          ex('Barbell_Bench_Press_-_Medium_Grip', 4, 6, 150),
          ex('Bent_Over_Barbell_Row', 4, 8, 120),
          ex('Standing_Military_Press', 3, 8, 90),
          ex('Wide-Grip_Lat_Pulldown', 3, 10, 90),
          ex('EZ-Bar_Curl', 2, 12, 60),
          ex('EZ-Bar_Skullcrusher', 2, 12, 60),
        ],
      },
      {
        id: 'tp-pierna-a',
        name: 'Pierna A',
        exercises: [
          ex('Barbell_Squat', 4, 6, 180),
          ex('Romanian_Deadlift', 3, 8, 120),
          ex('Leg_Extensions', 3, 12, 60),
          ex('Lying_Leg_Curls', 3, 12, 60),
          ex('Standing_Calf_Raises', 4, 15, 60),
        ],
      },
      {
        id: 'tp-torso-b',
        name: 'Torso B',
        exercises: [
          ex('Incline_Dumbbell_Press', 4, 10, 90),
          ex('One-Arm_Dumbbell_Row', 4, 10, 90),
          ex('Side_Lateral_Raise', 3, 15, 60),
          ex('Cable_Crossover', 3, 12, 60),
          ex('Hammer_Curls', 3, 12, 60),
          ex('Triceps_Pushdown_-_Rope_Attachment', 3, 12, 60),
        ],
      },
      {
        id: 'tp-pierna-b',
        name: 'Pierna B',
        exercises: [
          ex('Barbell_Deadlift', 3, 5, 180),
          ex('Leg_Press', 4, 10, 120),
          ex('Barbell_Walking_Lunge', 3, 10, 90),
          ex('Seated_Leg_Curl', 3, 12, 60),
          ex('Seated_Calf_Raise', 4, 15, 60),
        ],
      },
    ],
  },
  {
    id: 'fuerza-5x5',
    name: 'Fuerza 5×5',
    description:
      'Pocos ejercicios básicos y pesados. Alterna A y B y sube el peso cuando completes las 5×5.',
    level: 'Principiante',
    daysPerWeek: '3 días',
    routines: [
      {
        id: '5x5-a',
        name: '5×5 Entreno A',
        exercises: [
          ex('Barbell_Squat', 5, 5, 180),
          ex('Barbell_Bench_Press_-_Medium_Grip', 5, 5, 180),
          ex('Bent_Over_Barbell_Row', 5, 5, 180),
        ],
      },
      {
        id: '5x5-b',
        name: '5×5 Entreno B',
        exercises: [
          ex('Barbell_Squat', 5, 5, 180),
          ex('Standing_Military_Press', 5, 5, 180),
          ex('Barbell_Deadlift', 1, 5, 240),
        ],
      },
    ],
  },
  {
    id: 'split-clasico',
    name: 'Split por grupo muscular',
    description: 'Un grupo muscular por día, con mucho volumen. El clásico de culturismo.',
    level: 'Intermedio',
    daysPerWeek: '5 días',
    routines: [
      {
        id: 'split-pecho',
        name: 'Día de pecho',
        exercises: [
          ex('Barbell_Bench_Press_-_Medium_Grip', 4, 8, 120),
          ex('Incline_Dumbbell_Press', 3, 10, 90),
          ex('Dumbbell_Flyes', 3, 12, 60),
          ex('Cable_Crossover', 3, 15, 60),
        ],
      },
      {
        id: 'split-espalda',
        name: 'Día de espalda',
        exercises: [
          ex('Barbell_Deadlift', 3, 5, 180),
          ex('Wide-Grip_Lat_Pulldown', 4, 10, 90),
          ex('Seated_Cable_Rows', 3, 10, 90),
          ex('One-Arm_Dumbbell_Row', 3, 10, 60),
          ex('Face_Pull', 3, 15, 60),
        ],
      },
      {
        id: 'split-hombros',
        name: 'Día de hombros',
        exercises: [
          ex('Standing_Military_Press', 4, 8, 120),
          ex('Side_Lateral_Raise', 4, 15, 60),
          ex('Front_Dumbbell_Raise', 3, 12, 60),
          ex('Reverse_Flyes', 3, 15, 60),
          ex('Barbell_Shrug', 3, 12, 60),
        ],
      },
      {
        id: 'split-pierna',
        name: 'Día de pierna',
        exercises: [
          ex('Barbell_Squat', 4, 8, 180),
          ex('Leg_Press', 3, 12, 120),
          ex('Romanian_Deadlift', 3, 10, 120),
          ex('Leg_Extensions', 3, 15, 60),
          ex('Standing_Calf_Raises', 4, 15, 60),
        ],
      },
      {
        id: 'split-brazos',
        name: 'Día de brazos',
        exercises: [
          ex('Barbell_Curl', 4, 10, 60),
          ex('Close-Grip_Barbell_Bench_Press', 4, 8, 90),
          ex('Hammer_Curls', 3, 12, 60),
          ex('Triceps_Pushdown', 3, 12, 60),
          ex('Concentration_Curls', 3, 12, 60),
          ex('Cable_Rope_Overhead_Triceps_Extension', 3, 12, 60),
        ],
      },
    ],
  },
  {
    id: 'gluteos-piernas',
    name: 'Glúteos y piernas',
    description: 'Enfoque en glúteo e isquiotibiales, para añadir a cualquier semana.',
    level: 'Todos los niveles',
    daysPerWeek: '2 días',
    routines: [
      {
        id: 'gluteo-a',
        name: 'Glúteo A',
        exercises: [
          ex('Barbell_Hip_Thrust', 4, 10, 120),
          ex('Romanian_Deadlift', 3, 10, 90),
          ex('Dumbbell_Lunges', 3, 12, 60),
          ex('One-Legged_Cable_Kickback', 3, 12, 60),
          ex('Thigh_Abductor', 3, 15, 60),
        ],
      },
      {
        id: 'gluteo-b',
        name: 'Glúteo B',
        exercises: [
          ex('Barbell_Squat', 4, 8, 150),
          ex('Barbell_Glute_Bridge', 4, 12, 90),
          ex('Dumbbell_Step_Ups', 3, 10, 60),
          ex('Lying_Leg_Curls', 3, 12, 60),
          ex('Thigh_Abductor', 3, 15, 60),
        ],
      },
    ],
  },
  {
    id: 'solo-mancuernas',
    name: 'Solo mancuernas',
    description: 'Para casa o gimnasios pequeños: sólo necesitas un par de mancuernas y un banco.',
    level: 'Principiante',
    daysPerWeek: '3 días',
    routines: [
      {
        id: 'db-a',
        name: 'Mancuernas A',
        exercises: [
          ex('Dumbbell_Squat', 3, 12, 90),
          ex('Dumbbell_Bench_Press', 3, 10, 90),
          ex('One-Arm_Dumbbell_Row', 3, 10, 60),
          ex('Dumbbell_Shoulder_Press', 3, 10, 60),
          ex('Dumbbell_Bicep_Curl', 2, 12, 60),
        ],
      },
      {
        id: 'db-b',
        name: 'Mancuernas B',
        exercises: [
          ex('Stiff-Legged_Dumbbell_Deadlift', 3, 10, 90),
          ex('Dumbbell_Lunges', 3, 10, 90),
          ex('Incline_Dumbbell_Press', 3, 10, 90),
          ex('Bent_Over_Two-Dumbbell_Row', 3, 10, 60),
          ex('Side_Lateral_Raise', 3, 15, 60),
          ex('Standing_Dumbbell_Triceps_Extension', 2, 12, 60),
        ],
      },
    ],
  },
  {
    id: 'kettlebell',
    name: 'Kettlebell total',
    description: 'Fuerza y acondicionamiento con una sola kettlebell.',
    level: 'Intermedio',
    daysPerWeek: '2-3 días',
    routines: [
      {
        id: 'kb-a',
        name: 'Kettlebell A',
        exercises: [
          ex('One-Arm_Kettlebell_Swings', 4, 15, 60),
          ex('Goblet_Squat', 4, 10, 90),
          ex('One-Arm_Kettlebell_Row', 3, 10, 60),
          ex('Alternating_Kettlebell_Press', 3, 8, 90),
          ex('Kettlebell_Turkish_Get-Up_Squat_style', 3, 3, 90),
        ],
      },
      {
        id: 'kb-b',
        name: 'Kettlebell B',
        exercises: [
          ex('Kettlebell_Thruster', 4, 10, 90),
          ex('Kettlebell_One-Legged_Deadlift', 3, 8, 60),
          ex('One-Arm_Kettlebell_Clean', 3, 8, 60),
          ex('Kettlebell_Windmill', 3, 6, 60),
          ex('Kettlebell_Figure_8', 3, 10, 60),
        ],
      },
    ],
  },
  {
    id: 'maquinas',
    name: 'Máquinas para empezar',
    description: 'Todo en máquinas y poleas: recorridos guiados y fáciles de aprender.',
    level: 'Principiante',
    daysPerWeek: '2-3 días',
    routines: [
      {
        id: 'maq-a',
        name: 'Máquinas A',
        exercises: [
          ex('Leg_Press', 3, 12, 90),
          ex('Machine_Bench_Press', 3, 12, 90),
          ex('Seated_Cable_Rows', 3, 12, 90),
          ex('Machine_Shoulder_Military_Press', 3, 12, 90),
          ex('Leg_Extensions', 2, 15, 60),
          ex('Lying_Leg_Curls', 2, 15, 60),
        ],
      },
      {
        id: 'maq-b',
        name: 'Máquinas B',
        exercises: [
          ex('Smith_Machine_Squat', 3, 10, 90),
          ex('Leverage_Incline_Chest_Press', 3, 12, 90),
          ex('Wide-Grip_Lat_Pulldown', 3, 12, 90),
          ex('Machine_Bicep_Curl', 2, 12, 60),
          ex('Machine_Triceps_Extension', 2, 12, 60),
          ex('Ab_Crunch_Machine', 3, 15, 60),
        ],
      },
    ],
  },
  {
    id: 'core',
    name: 'Core y abdomen',
    description: 'Sesión corta de abdomen y estabilidad para terminar cualquier entreno.',
    level: 'Todos los niveles',
    daysPerWeek: '2-3 días',
    routines: [
      {
        id: 'core-a',
        name: 'Core',
        exercises: [
          ex('Cable_Crunch', 3, 15, 45),
          ex('Pallof_Press', 3, 10, 45),
          ex('Cable_Russian_Twists', 3, 12, 45),
          ex('Ab_Roller', 3, 10, 60),
          ex('Exercise_Ball_Pull-In', 3, 12, 45),
        ],
      },
    ],
  },
];
