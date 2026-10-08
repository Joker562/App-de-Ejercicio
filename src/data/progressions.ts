/**
 * Escaleras de dificultad de calistenia. Cada paso se considera dominado
 * cuando registras `goal.sets` series completadas con al menos `goal.reps`
 * repeticiones en una misma sesión (o lo marcas a mano).
 */
export interface ProgressionStep {
  id: string;
  exerciseId: string;
  goal: { sets: number; reps: number };
}

export interface Progression {
  id: string;
  name: string;
  description: string;
  steps: ProgressionStep[];
}

const step = (id: string, exerciseId: string, sets: number, reps: number): ProgressionStep => ({
  id,
  exerciseId,
  goal: { sets, reps },
});

export const PROGRESSIONS: Progression[] = [
  {
    id: 'empuje',
    name: 'Flexiones',
    description: 'De flexión inclinada a flexión a un brazo.',
    steps: [
      step('empuje-1', 'Incline_Push-Up', 3, 15),
      step('empuje-2', 'Pushups', 3, 20),
      step('empuje-3', 'Push-Ups_-_Close_Triceps_Position', 3, 15),
      step('empuje-4', 'Decline_Push-Up', 3, 15),
      step('empuje-5', 'Plyo_Push-up', 3, 10),
      step('empuje-6', 'Single-Arm_Push-Up', 3, 5),
    ],
  },
  {
    id: 'traccion',
    name: 'Dominadas',
    description: 'Del remo invertido a la dominada a un brazo.',
    steps: [
      step('traccion-1', 'Inverted_Row', 3, 12),
      step('traccion-2', 'Scapular_Pull-Up', 3, 10),
      step('traccion-3', 'Band_Assisted_Pull-Up', 3, 8),
      step('traccion-4', 'Pullups', 3, 10),
      step('traccion-5', 'Muscle_Up', 3, 3),
      step('traccion-6', 'One_Arm_Chin-Up', 3, 1),
    ],
  },
  {
    id: 'fondos',
    name: 'Fondos',
    description: 'Del banco a las anillas.',
    steps: [
      step('fondos-1', 'Bench_Dips', 3, 15),
      step('fondos-2', 'Parallel_Bar_Dip', 3, 12),
      step('fondos-3', 'Ring_Dips', 3, 10),
    ],
  },
  {
    id: 'piernas',
    name: 'Piernas',
    description: 'De la sentadilla a la sentadilla a una pierna.',
    steps: [
      step('piernas-1', 'Bodyweight_Squat', 3, 25),
      step('piernas-2', 'Bodyweight_Walking_Lunge', 3, 20),
      step('piernas-3', 'Freehand_Jump_Squat', 3, 15),
      step('piernas-4', 'Single-Leg_High_Box_Squat', 3, 8),
    ],
  },
  {
    id: 'core',
    name: 'Core colgado',
    description: 'Del crunch al pike colgado de la barra.',
    steps: [
      step('core-1', 'Crunches', 3, 25),
      step('core-2', 'Knee_Hip_Raise_On_Parallel_Bars', 3, 12),
      step('core-3', 'Hanging_Leg_Raise', 3, 10),
      step('core-4', 'Hanging_Pike', 3, 8),
    ],
  },
];
