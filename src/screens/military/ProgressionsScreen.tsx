import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { Card, Screen } from '../../components/ui';
import { findExercise } from '../../data/exercises';
import { PROGRESSIONS, type ProgressionStep } from '../../data/progressions';
import type { DashboardScreenProps } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useTheme } from '../../theme/useTheme';
import { bestReps, hasMastered } from '../../utils/military';

/**
 * Escaleras de calistenia. Un paso queda dominado automáticamente al registrar
 * el objetivo (series x reps en una sesión) o a mano con el check.
 */
export function ProgressionsScreen({ navigation }: DashboardScreenProps<'Progressions'>) {
  const theme = useTheme();
  const sessions = useHistoryStore((s) => s.sessions);
  const manual = useAppStore((s) => s.masteredSteps);
  const toggleMastered = useAppStore((s) => s.toggleMastered);

  const isMastered = (step: ProgressionStep) =>
    manual.includes(step.id) || hasMastered(sessions, step.exerciseId, step.goal);

  return (
    <Screen>
      <Text style={[styles.intro, { color: theme.textMuted }]}>
        Registra tus reps en los entrenamientos militares: al cumplir el objetivo de un paso, se
        marca solo. También puedes marcarlo a mano.
      </Text>
      {PROGRESSIONS.map((progression) => {
        // Dominar un paso implica los anteriores: cuenta el más alto dominado.
        const highest = progression.steps.reduce((max, s, i) => (isMastered(s) ? i : max), -1);
        const firstPending = highest + 1 < progression.steps.length ? highest + 1 : -1;
        const masteredCount = highest + 1;
        return (
          <Card key={progression.id}>
            <Text style={[styles.name, { color: theme.text }]}>{progression.name}</Text>
            <Text style={[styles.meta, { color: theme.accent }]}>
              {masteredCount}/{progression.steps.length} dominados · {progression.description}
            </Text>
            {progression.steps.map((step, i) => {
              const exercise = findExercise(step.exerciseId);
              const mastered = i <= highest;
              const current = i === firstPending;
              const best = bestReps(sessions, step.exerciseId);
              return (
                <View
                  key={step.id}
                  style={[
                    styles.step,
                    {
                      borderColor: current ? theme.accent : theme.border,
                      backgroundColor: current ? theme.surfaceAlt : 'transparent',
                    },
                  ]}
                >
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ExerciseDetail', { exerciseId: step.exerciseId })
                    }
                    accessibilityLabel={`Ver cómo se hace ${exercise?.name}`}
                  >
                    {exercise ? (
                      <ExerciseAnimation exercise={exercise} animated={false} style={styles.thumb} />
                    ) : null}
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.stepName,
                        { color: mastered ? theme.textMuted : theme.text },
                      ]}
                    >
                      {i + 1}. {exercise?.name ?? step.exerciseId}
                    </Text>
                    <Text style={[styles.goal, { color: current ? theme.accent : theme.textMuted }]}>
                      {current ? 'Tu objetivo: ' : 'Objetivo: '}
                      {step.goal.sets} × {step.goal.reps}
                      {best > 0 ? ` · tu mejor serie: ${best}` : ''}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleMastered(step.id)}
                    hitSlop={8}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: mastered }}
                    accessibilityLabel={`Marcar ${exercise?.name} como dominado`}
                  >
                    <Ionicons
                      name={mastered ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={mastered ? theme.success : theme.textMuted}
                    />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20 },
  name: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 13, fontWeight: '600' },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  thumb: { width: 56, borderRadius: 6 },
  stepName: { fontSize: 15, fontWeight: '700' },
  goal: { fontSize: 12, marginTop: 2 },
});
