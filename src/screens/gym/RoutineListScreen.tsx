import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '../../components/ui';
import { findExercise } from '../../data/data';
import type { DashboardScreenProps } from '../../navigation/types';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useTheme } from '../../theme/useTheme';
import type { GymRoutine } from '../../types';
import { confirmAction } from '../../utils/dialogs';

export function RoutineListScreen({ navigation }: DashboardScreenProps<'RoutineList'>) {
  const theme = useTheme();
  const allRoutines = useRoutineStore((s) => s.routines);
  // Las rutinas militares se gestionan desde Programas (modo militar).
  const routines = allRoutines.filter((r) => r.mode !== 'military');
  const removeRoutine = useRoutineStore((s) => s.removeRoutine);
  const active = useWorkoutStore((s) => s.active);
  const startGym = useWorkoutStore((s) => s.startGym);

  const start = (routine: GymRoutine) => {
    const go = () => {
      startGym(routine);
      navigation.navigate('ActiveWorkout');
    };
    if (!active) return go();
    confirmAction({
      title: 'Entrenamiento en curso',
      message: `Se descartará "${active.title}". ¿Empezar "${routine.name}"?`,
      confirmText: 'Empezar',
      destructive: true,
      onConfirm: go,
    });
  };

  const confirmDelete = (routine: GymRoutine) =>
    confirmAction({
      title: 'Eliminar rutina',
      message: `¿Eliminar "${routine.name}"?`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => removeRoutine(routine.id),
    });

  return (
    <Screen>
      <View style={styles.actions}>
        <Button
          title="Rutinas precreadas"
          onPress={() => navigation.navigate('RoutineTemplates')}
          style={styles.flex}
        />
        <Button
          title="Crear rutina"
          variant="secondary"
          onPress={() => navigation.navigate('RoutineBuilder')}
          style={styles.flex}
        />
      </View>

      {routines.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          No tienes rutinas. Crea la primera.
        </Text>
      ) : null}

      {routines.map((routine) => (
        <Card key={routine.id}>
          <Text style={[styles.name, { color: theme.text }]}>{routine.name}</Text>
          {routine.exercises.map((re, index) => (
            <Text key={`${re.exerciseId}-${index}`} style={[styles.exercise, { color: theme.textMuted }]}>
              {findExercise(re.exerciseId)?.name ?? re.exerciseId} · {re.targetSets} x{' '}
              {re.targetReps} · {re.restSec}s descanso
            </Text>
          ))}
          <View style={styles.actions}>
            <Button title="Empezar" onPress={() => start(routine)} style={styles.flex} />
            <Button
              title="Editar"
              variant="secondary"
              onPress={() => navigation.navigate('RoutineBuilder', { routineId: routine.id })}
            />
            <Button title="Borrar" variant="secondary" onPress={() => confirmDelete(routine)} />
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
  name: { fontSize: 20, fontWeight: '800' },
  exercise: { fontSize: 14 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  flex: { flex: 1 },
});
