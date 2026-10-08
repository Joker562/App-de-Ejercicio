import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button, Card, ListItem, Screen, SectionTitle } from '../../components/ui';
import { MILITARY_LEVELS, MILITARY_PROGRAMS } from '../../data/data';
import { findExercise } from '../../data/exercises';
import type { DashboardScreenProps } from '../../navigation/types';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useTheme } from '../../theme/useTheme';
import type { GymRoutine, MilitaryProgram } from '../../types';
import { confirmAction } from '../../utils/dialogs';
import { describeTimer } from '../../utils/intervals';
import { isProgramUnlocked, programBest, rankProgress } from '../../utils/military';

export function ProgramListScreen({ navigation }: DashboardScreenProps<'ProgramList'>) {
  const theme = useTheme();
  const active = useWorkoutStore((s) => s.active);
  const startMilitary = useWorkoutStore((s) => s.startMilitary);
  const startMilitaryRoutine = useWorkoutStore((s) => s.startMilitaryRoutine);
  const sessions = useHistoryStore((s) => s.sessions);
  const allRoutines = useRoutineStore((s) => s.routines);
  const removeRoutine = useRoutineStore((s) => s.removeRoutine);
  const myRoutines = allRoutines.filter((r) => r.mode === 'military');
  const { currentIndex, current } = rankProgress(sessions);

  /** Confirma si hay un entrenamiento en curso antes de empezar otro. */
  const startWith = (title: string, begin: () => void) => {
    const go = () => {
      begin();
      navigation.navigate('ActiveWorkout');
    };
    if (!active) return go();
    confirmAction({
      title: 'Entrenamiento en curso',
      message: `Se descartará "${active.title}". ¿Empezar "${title}"?`,
      confirmText: 'Empezar',
      destructive: true,
      onConfirm: go,
    });
  };

  const start = (program: MilitaryProgram) => {
    if (program.fitnessTest) {
      navigation.navigate('FitnessTest');
      return;
    }
    startWith(program.name, () => startMilitary(program));
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
      <ListItem
        title="Progresiones de calistenia"
        subtitle="Escaleras de dificultad: de flexión inclinada a flexión a un brazo"
        onPress={() => navigation.navigate('Progressions')}
        right={<Ionicons name="chevron-forward" size={18} color={theme.textMuted} />}
      />

      <SectionTitle>Mis rutinas militares</SectionTitle>
      {myRoutines.map((routine) => (
        <Card key={routine.id}>
          <Text style={[styles.name, { color: theme.text }]}>{routine.name}</Text>
          <Text style={[styles.description, { color: theme.textMuted }]}>
            {routine.exercises
              .map((re) => `${findExercise(re.exerciseId)?.name ?? re.exerciseId} ${re.targetSets}×${re.targetReps}`)
              .join(' · ')}
          </Text>
          <View style={styles.actions}>
            <Button
              title="Empezar"
              onPress={() => startWith(routine.name, () => startMilitaryRoutine(routine))}
              style={styles.flex}
            />
            <Button
              title="Editar"
              variant="secondary"
              onPress={() => navigation.navigate('RoutineBuilder', { routineId: routine.id })}
            />
            <Button title="Borrar" variant="secondary" onPress={() => confirmDelete(routine)} />
          </View>
        </Card>
      ))}
      <Button
        title="+ Crear rutina militar"
        variant="secondary"
        onPress={() => navigation.navigate('RoutineBuilder', { mode: 'military' })}
      />

      <SectionTitle>Programas · tu rango: {current.name}</SectionTitle>
      {MILITARY_PROGRAMS.map((program) => {
        const level = MILITARY_LEVELS.find((l) => l.id === program.levelId);
        const unlocked = isProgramUnlocked(program, currentIndex);
        const best = programBest(sessions, program);
        return (
          <Card key={program.id} style={unlocked ? undefined : styles.locked}>
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: theme.text }]}>{program.name}</Text>
              {unlocked ? null : <Ionicons name="lock-closed" size={18} color={theme.textMuted} />}
            </View>
            <Text style={[styles.meta, { color: theme.accent }]}>
              Rango: {level?.name} · {program.points} pts
              {program.timer ? ` · ${describeTimer(program.timer)}` : ''}
              {program.forTime ? ' · por tiempo' : ''}
            </Text>
            {best ? (
              <Text style={[styles.best, { color: theme.success }]}>{best}</Text>
            ) : null}
            <Text style={[styles.description, { color: theme.textMuted }]}>
              {program.description}
            </Text>
            {program.movements.map((m) =>
              m.exerciseId ? (
                <Pressable
                  key={m.name}
                  onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: m.exerciseId! })}
                  accessibilityRole="button"
                  accessibilityLabel={`Ver cómo se hace ${m.name}`}
                  style={styles.movementRow}
                >
                  <Text style={[styles.movement, { color: theme.text }]}>
                    {'•'} {m.name}: {m.target}
                  </Text>
                  <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
                </Pressable>
              ) : (
                <Text key={m.name} style={[styles.movement, { color: theme.text }]}>
                  {'•'} {m.name}: {m.target}
                </Text>
              ),
            )}
            {unlocked ? (
              <Button
                title={program.fitnessTest ? 'Hacer la prueba' : 'Empezar'}
                onPress={() => start(program)}
                style={styles.button}
              />
            ) : (
              <Text style={[styles.lockText, { color: theme.textMuted }]}>
                Se desbloquea al llegar a {level?.name}. Gana puntos con los programas disponibles.
              </Text>
            )}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 20, fontWeight: '800', flexShrink: 1 },
  meta: { fontSize: 13, fontWeight: '700' },
  best: { fontSize: 13, fontWeight: '800' },
  description: { fontSize: 14, lineHeight: 20 },
  movement: { fontSize: 14, flexShrink: 1 },
  movementRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  button: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  flex: { flex: 1 },
  locked: { opacity: 0.6 },
  lockText: { fontSize: 13, marginTop: 4 },
});
