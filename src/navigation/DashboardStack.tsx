import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExerciseLibraryScreen } from '../screens/gym/ExerciseLibraryScreen';
import { RoutineBuilderScreen } from '../screens/gym/RoutineBuilderScreen';
import { RoutineListScreen } from '../screens/gym/RoutineListScreen';
import { ProgramListScreen } from '../screens/military/ProgramListScreen';
import { TimerScreen } from '../screens/military/TimerScreen';
import { useTheme } from '../theme/useTheme';
import type { DashboardStackParamList } from './types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Stack.Screen name="ProgramList" component={ProgramListScreen} options={{ title: 'Programas' }} />
      <Stack.Screen name="Timer" component={TimerScreen} options={{ title: 'Temporizadores' }} />
      <Stack.Screen name="RoutineList" component={RoutineListScreen} options={{ title: 'Mis rutinas' }} />
      <Stack.Screen
        name="RoutineBuilder"
        component={RoutineBuilderScreen}
        options={({ route }) => ({
          title: route.params?.routineId ? 'Editar rutina' : 'Nueva rutina',
        })}
      />
      <Stack.Screen
        name="ExerciseLibrary"
        component={ExerciseLibraryScreen}
        options={{ title: 'Ejercicios' }}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ title: 'Entrenamiento' }}
      />
    </Stack.Navigator>
  );
}
