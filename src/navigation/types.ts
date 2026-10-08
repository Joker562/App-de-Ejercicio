import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TrainingMode } from '../types';

/** routine: rutina de gimnasio; military-routine: rutina militar; workout: sesión en curso. */
export type PickTarget = 'routine' | 'military-routine' | 'workout';

export type DashboardStackParamList = {
  Dashboard: undefined;
  ProgramList: undefined;
  Timer: undefined;
  RoutineList: undefined;
  RoutineTemplates: undefined;
  FitnessTest: undefined;
  Progressions: undefined;
  RoutineBuilder:
    | {
        routineId?: string;
        /** Rutina nueva militar (las existentes llevan su modo guardado). */
        mode?: TrainingMode;
        /** Ejercicio elegido en la biblioteca; el nonce permite añadir el mismo dos veces. */
        picked?: { exerciseId: string; nonce: string };
      }
    | undefined;
  /**
   * Con pickFor, la biblioteca sirve para elegir un ejercicio: para la rutina
   * que se está creando o para añadirlo a la sesión en curso.
   */
  ExerciseLibrary: { pickFor?: PickTarget } | undefined;
  ExerciseDetail: { exerciseId: string; pickFor?: PickTarget };
  PlateCalculator: { weightKg?: number } | undefined;
  ActiveWorkout: undefined;
};

export type HistoryStackParamList = {
  History: undefined;
  SessionDetail: { sessionId: string };
};

export type RootTabParamList = {
  Inicio: NavigatorScreenParams<DashboardStackParamList>;
  Historial: NavigatorScreenParams<HistoryStackParamList>;
  Perfil: undefined;
};

export type HistoryScreenProps<T extends keyof HistoryStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type TabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;
