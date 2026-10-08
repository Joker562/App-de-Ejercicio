import { useMemo } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { IntervalTimer } from '../components/IntervalTimer';
import { RestTimer } from '../components/RestTimer';
import { SetRow } from '../components/SetRow';
import { Button, Card, Screen } from '../components/ui';
import type { DashboardScreenProps } from '../navigation/types';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useTheme } from '../theme/useTheme';
import type { ClockControls } from '../utils/clock';
import { formatDuration } from '../utils/format';
import { useNow } from '../utils/useNow';

/**
 * Vista genérica del entrenamiento en curso. El modo decide los detalles:
 * - Militar: temporizador de intervalos (si el programa lo tiene) y checkboxes.
 * - Gimnasio: inputs de reps/peso y descanso automático entre series.
 */
export function ActiveWorkoutScreen({ navigation }: DashboardScreenProps<'ActiveWorkout'>) {
  const theme = useTheme();
  const active = useWorkoutStore((s) => s.active);
  const clock = useWorkoutStore((s) => s.clock);
  const startTimer = useWorkoutStore((s) => s.startTimer);
  const pauseTimer = useWorkoutStore((s) => s.pauseTimer);
  const resetTimer = useWorkoutStore((s) => s.resetTimer);
  const addRound = useWorkoutStore((s) => s.addRound);
  const addSet = useWorkoutStore((s) => s.addSet);
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const now = useNow(active !== null, 1000);

  const controls = useMemo<ClockControls>(
    () => ({ start: startTimer, pause: pauseTimer, reset: resetTimer }),
    [startTimer, pauseTimer, resetTimer],
  );

  if (!active) {
    return (
      <Screen>
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          No hay ningún entrenamiento en curso.
        </Text>
        <Button title="Volver" onPress={() => navigation.popToTop()} />
      </Screen>
    );
  }

  const totalSets = active.exercises.reduce((n, ex) => n + ex.sets.length, 0);
  const doneSets = active.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed).length,
    0,
  );

  const finish = () => {
    const nothingLogged = doneSets === 0 && active.roundsCompleted === 0;
    const doFinish = () => {
      finishWorkout();
      navigation.popToTop();
      navigation.navigate('Historial');
    };
    if (!nothingLogged) return doFinish();
    Alert.alert('Sin registros', 'No has marcado ninguna serie. ¿Guardar igualmente?', [
      { text: 'Seguir entrenando', style: 'cancel' },
      { text: 'Guardar', onPress: doFinish },
    ]);
  };

  const cancel = () =>
    Alert.alert('Descartar entrenamiento', 'Se perderá todo lo registrado en esta sesión.', [
      { text: 'Seguir entrenando', style: 'cancel' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => {
          cancelWorkout();
          navigation.popToTop();
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Screen>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{active.title}</Text>
          <Text style={[styles.meta, { color: theme.textMuted }]}>
            Tiempo total {formatDuration((now - active.startedAt) / 1000)}
            {totalSets > 0 ? ` · ${doneSets}/${totalSets} series` : ''}
          </Text>
        </View>

        {active.timer ? (
          <IntervalTimer
            config={active.timer}
            clock={clock}
            controls={controls}
            rounds={active.roundsCompleted}
            onAddRound={addRound}
          />
        ) : null}

        {active.exercises.map((exercise) => (
          <Card key={exercise.id}>
            <View style={styles.exerciseHeader}>
              <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
              <Text style={[styles.target, { color: theme.accent }]}>{exercise.target}</Text>
            </View>

            {active.mode === 'gym' && exercise.sets.length > 0 ? (
              <View style={styles.columns}>
                <Text style={[styles.column, styles.indexColumn, { color: theme.textMuted }]}>#</Text>
                <Text style={[styles.column, { color: theme.textMuted }]}>Reps</Text>
                <Text style={[styles.column, { color: theme.textMuted }]}>Peso</Text>
                <View style={styles.trailing} />
              </View>
            ) : null}

            {exercise.sets.map((set, index) => (
              <SetRow
                key={set.id}
                exerciseId={exercise.id}
                set={set}
                index={index}
                mode={active.mode}
              />
            ))}

            {active.mode === 'gym' ? (
              <Button title="+ Añadir serie" variant="secondary" onPress={() => addSet(exercise.id)} />
            ) : null}
          </Card>
        ))}

        <Button title="Terminar y guardar" onPress={finish} />
        <Button title="Descartar" variant="danger" onPress={cancel} />
        {/* Hueco para que el descanso flotante no tape los botones finales. */}
        {active.mode === 'gym' ? <View style={styles.restSpacer} /> : null}
      </Screen>

      {active.mode === 'gym' ? (
        <View style={styles.restDock}>
          <RestTimer />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
  header: { gap: 2 },
  title: { fontSize: 24, fontWeight: '800' },
  meta: { fontSize: 14, fontVariant: ['tabular-nums'] },
  exerciseHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  exerciseName: { fontSize: 18, fontWeight: '700', flex: 1 },
  target: { fontSize: 13, fontWeight: '700' },
  columns: { flexDirection: 'row', gap: 10, paddingHorizontal: 8 },
  column: { flex: 1, fontSize: 12, textAlign: 'center' },
  indexColumn: { flex: 0, minWidth: 28, textAlign: 'left' },
  // Ancho del icono de borrar + checkbox + huecos de SetRow.
  trailing: { width: 72 },
  restDock: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  restSpacer: { height: 110 },
});
