import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExerciseAnimation } from '../components/ExerciseAnimation';
import { LineChart } from '../components/LineChart';
import { Card, ListItem, Screen, SectionTitle } from '../components/ui';
import { findExercise } from '../data/exercises';
import type { HistoryScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useTheme } from '../theme/useTheme';
import { formatDate, kgToUnit } from '../utils/format';
import { exerciseHistory } from '../utils/records';

function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Evolución de un ejercicio: 1RM estimado y peso máximo, o reps si es sin peso. */
export function ExerciseProgressScreen({ navigation, route }: HistoryScreenProps<'ExerciseProgress'>) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const sessions = useHistoryStore((s) => s.sessions);
  const { exerciseId } = route.params;
  const exercise = findExercise(exerciseId);
  const history = exerciseHistory(sessions, exerciseId);

  const weighted = history.some((p) => p.maxWeightKg > 0);
  const best = {
    e1rm: Math.max(0, ...history.map((p) => p.bestE1rmKg)),
    weight: Math.max(0, ...history.map((p) => p.maxWeightKg)),
    reps: Math.max(0, ...history.map((p) => p.bestReps)),
  };
  const first = history[0];
  const last = history[history.length - 1];
  const change =
    first && last && history.length > 1
      ? weighted
        ? kgToUnit(last.bestE1rmKg - first.bestE1rmKg, unit)
        : last.bestReps - first.bestReps
      : null;

  const stats = weighted
    ? [
        { label: `1RM estimado (${unit})`, value: String(kgToUnit(best.e1rm, unit)) },
        { label: `Peso máximo (${unit})`, value: String(kgToUnit(best.weight, unit)) },
        { label: 'Sesiones', value: String(history.length) },
      ]
    : [
        { label: 'Máx. reps', value: String(best.reps) },
        { label: 'Sesiones', value: String(history.length) },
        { label: 'Series', value: String(history.reduce((n, p) => n + p.sets, 0)) },
      ];

  // Últimas 12 sesiones en el gráfico.
  const recent = history.slice(-12);
  const series = weighted
    ? [
        {
          name: '1RM estimado',
          color: theme.accent,
          points: recent.map((p) => ({ label: shortDate(p.date), value: kgToUnit(p.bestE1rmKg, unit) })),
        },
        {
          name: 'Peso máximo',
          color: theme.primary,
          points: recent.map((p) => ({ label: shortDate(p.date), value: kgToUnit(p.maxWeightKg, unit) })),
        },
      ]
    : [
        {
          name: 'Máx. reps',
          color: theme.accent,
          points: recent.map((p) => ({ label: shortDate(p.date), value: p.bestReps })),
        },
      ];

  return (
    <Screen>
      <View style={styles.header}>
        {exercise ? (
          <Pressable
            onPress={() =>
              navigation.navigate('Inicio', { screen: 'ExerciseDetail', params: { exerciseId } })
            }
            accessibilityLabel={`Ver cómo se hace ${exercise.name}`}
          >
            <ExerciseAnimation exercise={exercise} animated={false} style={styles.thumb} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{exercise?.name ?? exerciseId}</Text>
          {change !== null ? (
            <Text style={{ color: change >= 0 ? theme.success : theme.danger, fontWeight: '700' }}>
              {change >= 0 ? '+' : ''}
              {change} {weighted ? unit : 'reps'} desde tu primera sesión
            </Text>
          ) : null}
        </View>
      </View>

      {history.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          Aún no has completado series de este ejercicio.
        </Text>
      ) : (
        <>
          <Card style={styles.stats}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
              </View>
            ))}
          </Card>

          <Card>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {weighted ? `Evolución (${unit})` : 'Repeticiones máximas'}
            </Text>
            <LineChart series={series} />
          </Card>

          <SectionTitle>Sesiones</SectionTitle>
          {[...history].reverse().map((point) => (
            <ListItem
              key={point.sessionId}
              title={formatDate(point.date)}
              subtitle={
                weighted
                  ? `${point.sets} series · máx. ${kgToUnit(point.maxWeightKg, unit)} ${unit} · 1RM ${kgToUnit(point.bestE1rmKg, unit)} ${unit}`
                  : `${point.sets} series · máx. ${point.bestReps} reps`
              }
              onPress={() => navigation.navigate('SessionDetail', { sessionId: point.sessionId })}
              right={<Ionicons name="chevron-forward" size={18} color={theme.textMuted} />}
            />
          ))}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 84, borderRadius: 8 },
  name: { fontSize: 20, fontWeight: '800' },
  empty: { textAlign: 'center', paddingVertical: 24 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11, textAlign: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
});
