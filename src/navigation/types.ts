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
  RoutineBuilder: { routineId?: string } | undefined;
  ExerciseLibrary: undefined;
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
