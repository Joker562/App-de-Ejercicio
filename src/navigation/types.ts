import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type DashboardStackParamList = {
  Dashboard: undefined;
  ProgramList: undefined;
  Timer: undefined;
  RoutineList: undefined;
  RoutineBuilder:
    | {
        routineId?: string;
        /** Ejercicio elegido en la biblioteca; el nonce permite añadir el mismo dos veces. */
        picked?: { exerciseId: string; nonce: string };
      }
    | undefined;
  /** Con pickForRoutine, la biblioteca sirve para elegir ejercicios de una rutina. */
  ExerciseLibrary: { pickForRoutine?: boolean } | undefined;
  ExerciseDetail: { exerciseId: string; pickForRoutine?: boolean };
  ActiveWorkout: undefined;
};

export type RootTabParamList = {
  Inicio: NavigatorScreenParams<DashboardStackParamList>;
  Historial: undefined;
  Perfil: undefined;
};

export type DashboardScreenProps<T extends keyof DashboardStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<DashboardStackParamList, T>,
    BottomTabScreenProps<RootTabParamList>
  >;

export type TabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;
