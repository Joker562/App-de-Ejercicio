import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IntervalTimer } from '../components/IntervalTimer';
import { RestTimer } from '../components/RestTimer';
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard';
import { Button, Screen } from '../components/ui';
import type { DashboardScreenProps } from '../navigation/types';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useTheme } from '../theme/useTheme';
import type { ClockControls } from '../utils/clock';
import { confirmAction } from '../utils/dialogs';
import { formatDuration } from '../utils/format';
import { isWorkingSet } from '../utils/progression';
import { isLinkedWithNext } from '../utils/supersets';
import { useKeepScreenOn } from '../utils/useKeepScreenOn';
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
  const finishWorkout = useWorkoutStore((s) => s.finishWorkout);
  const cancelWorkout = useWorkoutStore((s) => s.cancelWorkout);
  const now = useNow(active !== null, 1000);
  // Que la pantalla no se apague a mitad de un AMRAP o de un descanso.
  useKeepScreenOn('active-workout');

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

  // Series efectivas: los calentamientos no cuentan.
  const totalSets = active.exercises.reduce((n, ex) => n + ex.sets.filter(isWorkingSet).length, 0);
  const doneSets = active.exercises.reduce(
    (n, ex) => n + ex.sets.filter((s) => s.completed && isWorkingSet(s)).length,
    0,
  );

  const finish = () => {
    const nothingLogged = doneSets === 0 && active.roundsCompleted === 0;
    const doFinish = () => {
      const session = finishWorkout();
      navigation.popToTop();
      if (session) {
        // initial: false deja la lista del historial debajo para poder volver.
        navigation.navigate('Historial', {
          screen: 'SessionDetail',
          params: { sessionId: session.id },
          initial: false,
        });
      }
    };
    if (!nothingLogged) return doFinish();
    confirmAction({
      title: 'Sin registros',
      message: 'No has marcado ninguna serie. ¿Guardar igualmente?',
      confirmText: 'Guardar',
      cancelText: 'Seguir entrenando',
      onConfirm: doFinish,
    });
  };

  const cancel = () =>
    confirmAction({
      title: 'Descartar entrenamiento',
      message: 'Se perderá todo lo registrado en esta sesión.',
      confirmText: 'Descartar',
      cancelText: 'Seguir entrenando',
      destructive: true,
      onConfirm: () => {
        cancelWorkout();
        navigation.popToTop();
      },
    });

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
            // Los avisos de este temporizador los da WorkoutCues (en la raíz).
            cues={false}
          />
        ) : null}

        {active.exercises.map((exercise, index) => {
          const linked = isLinkedWithNext(active.exercises, index);
          return (
            <View key={exercise.id} style={styles.exerciseBlock}>
              <WorkoutExerciseCard
                exercise={exercise}
                mode={active.mode}
                isFirst={index === 0}
                isLast={index === active.exercises.length - 1}
                linkedWithNext={linked}
                onOpenDetail={(exerciseId) => navigation.navigate('ExerciseDetail', { exerciseId })}
                onOpenPlates={(weightKg) => navigation.navigate('PlateCalculator', { weightKg })}
              />
              {linked ? (
                <View style={styles.supersetLink}>
                  <Ionicons name="link" size={14} color={theme.accent} />
                  <Text style={[styles.supersetText, { color: theme.accent }]}>
                    Superserie: sin descanso hasta el último ejercicio
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <Button
          title="+ Añadir ejercicio"
          variant="secondary"
          onPress={() => navigation.navigate('ExerciseLibrary', { pickFor: 'workout' })}
        />
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
  exerciseBlock: { gap: 4 },
  supersetLink: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12 },
  supersetText: { fontSize: 12, fontWeight: '700' },
  restDock: { position: 'absolute', left: 12, right: 12, bottom: 12 },
  restSpacer: { height: 110 },
});
