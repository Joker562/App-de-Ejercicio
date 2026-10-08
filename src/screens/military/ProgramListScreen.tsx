import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button, Card, Screen } from '../../components/ui';
import { MILITARY_LEVELS, MILITARY_PROGRAMS } from '../../data/data';
import type { DashboardScreenProps } from '../../navigation/types';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useTheme } from '../../theme/useTheme';
import type { MilitaryProgram } from '../../types';
import { confirmAction } from '../../utils/dialogs';
import { describeTimer } from '../../utils/intervals';

export function ProgramListScreen({ navigation }: DashboardScreenProps<'ProgramList'>) {
  const theme = useTheme();
  const active = useWorkoutStore((s) => s.active);
  const startMilitary = useWorkoutStore((s) => s.startMilitary);

  const start = (program: MilitaryProgram) => {
    const go = () => {
      startMilitary(program);
      navigation.navigate('ActiveWorkout');
    };
    if (!active) return go();
    confirmAction({
      title: 'Entrenamiento en curso',
      message: `Se descartará "${active.title}". ¿Empezar "${program.name}"?`,
      confirmText: 'Empezar',
      destructive: true,
      onConfirm: go,
    });
  };

  return (
    <Screen>
      {MILITARY_PROGRAMS.map((program) => {
        const level = MILITARY_LEVELS.find((l) => l.id === program.levelId);
        return (
          <Card key={program.id}>
            <Text style={[styles.name, { color: theme.text }]}>{program.name}</Text>
            <Text style={[styles.meta, { color: theme.accent }]}>
              Nivel: {level?.name}
              {program.timer ? ` · ${describeTimer(program.timer)}` : ''}
            </Text>
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
            {program.movements.some((m) => m.exerciseId) ? (
              <Text style={[styles.hint, { color: theme.textMuted }]}>
                Toca un ejercicio para ver cómo se hace.
              </Text>
            ) : null}
            <Button title="Empezar" onPress={() => start(program)} style={styles.button} />
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 13, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20 },
  movement: { fontSize: 14, flexShrink: 1 },
  movementRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hint: { fontSize: 12 },
  button: { marginTop: 8 },
});
