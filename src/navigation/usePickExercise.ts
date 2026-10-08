import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { TrainingMode } from '../types';
import { createId } from '../utils/format';
import type { DashboardStackParamList, PickTarget } from './types';

/**
 * Qué hacer al elegir un ejercicio en la biblioteca o en su detalle:
 * - routine: volver al creador de rutinas con el ejercicio en params.picked;
 * - workout: añadirlo a la sesión en curso y volver a ella.
 */
export function usePickExercise(pickFor: PickTarget | undefined) {
  const navigation = useNavigation<NativeStackNavigationProp<DashboardStackParamList>>();
  const addExercise = useWorkoutStore((s) => s.addExercise);

  if (!pickFor) return null;

  return (exerciseId: string) => {
    if (pickFor === 'routine') {
      navigation.popTo(
        'RoutineBuilder',
        { picked: { exerciseId, nonce: createId() } },
        { merge: true },
      );
    } else {
      addExercise(exerciseId);
      navigation.popTo('ActiveWorkout');
    }
  };
}

/** Modo del catálogo a mostrar según para qué se elige. */
export function usePickMode(pickFor: PickTarget | undefined): TrainingMode {
  const appMode = useAppStore((s) => s.mode);
  const workoutMode = useWorkoutStore((s) => s.active?.mode);
  if (pickFor === 'routine') return 'gym'; // las rutinas personalizadas son de gimnasio
  if (pickFor === 'workout') return workoutMode ?? appMode;
  return appMode;
}
