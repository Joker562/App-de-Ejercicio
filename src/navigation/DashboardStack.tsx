import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActiveWorkoutScreen } from '../screens/ActiveWorkoutScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ExerciseDetailScreen } from '../screens/gym/ExerciseDetailScreen';
import { ExerciseLibraryScreen } from '../screens/gym/ExerciseLibraryScreen';
import { PlateCalculatorScreen } from '../screens/gym/PlateCalculatorScreen';
import { RoutineBuilderScreen } from '../screens/gym/RoutineBuilderScreen';
import { RoutineListScreen } from '../screens/gym/RoutineListScreen';
import { RoutineTemplatesScreen } from '../screens/gym/RoutineTemplatesScreen';
import { ProgramListScreen } from '../screens/military/ProgramListScreen';
import { TimerScreen } from '../screens/military/TimerScreen';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import type { DashboardStackParamList } from './types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export function DashboardStack() {
  const theme = useTheme();
  const mode = useAppStore((s) => s.mode);
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
        name="RoutineTemplates"
        component={RoutineTemplatesScreen}
        options={{ title: 'Rutinas precreadas' }}
      />
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
        options={({ route }) => ({
          title: route.params?.pickFor
            ? 'Elegir ejercicio'
            : mode === 'military'
              ? 'Ejercicios militares'
              : 'Ejercicios de gimnasio',
        })}
      />
      <Stack.Screen
        name="PlateCalculator"
        component={PlateCalculatorScreen}
        options={{ title: 'Discos y calentamiento' }}
      />
      <Stack.Screen
        name="ExerciseDetail"
        component={ExerciseDetailScreen}
        options={{ title: 'Cómo se hace' }}
      />
      <Stack.Screen
        name="ActiveWorkout"
        component={ActiveWorkoutScreen}
        options={{ title: 'Entrenamiento' }}
      />
    </Stack.Navigator>
  );
}
