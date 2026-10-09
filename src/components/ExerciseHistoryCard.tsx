import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { WeightUnit } from '../types';
import { formatDate, kgToUnit } from '../utils/format';
import type { ExercisePoint } from '../utils/records';
import { LineChart } from './LineChart';
import { Button, Card } from './ui';

const CHART_POINTS = 8;

function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * Resumen de tu historial con un ejercicio: última vez, mejor marca y un
 * gráfico pequeño. Con peso muestra el 1RM estimado; sin peso, las reps.
 */
export function ExerciseHistoryCard({
  history,
  unit,
  onOpenProgress,
}: {
  /** De más antigua a más reciente (exerciseHistory). */
  history: ExercisePoint[];
  unit: WeightUnit;
  onOpenProgress?: () => void;
}) {
  const theme = useTheme();
  const last = history[history.length - 1];
  const weighted = history.some((p) => p.maxWeightKg > 0);
  const bestE1rm = Math.max(...history.map((p) => p.bestE1rmKg));
  const bestWeight = Math.max(...history.map((p) => p.maxWeightKg));
  const bestReps = Math.max(...history.map((p) => p.bestReps));

  const stats = weighted
    ? [
        { label: 'Última vez', value: `${kgToUnit(last.maxWeightKg, unit)} ${unit}` },
        { label: 'Peso máximo', value: `${kgToUnit(bestWeight, unit)} ${unit}` },
        { label: '1RM estimado', value: `${kgToUnit(bestE1rm, unit)} ${unit}` },
      ]
    : [
        { label: 'Última vez', value: `${last.bestReps} reps` },
        { label: 'Máx. reps', value: String(bestReps) },
        { label: 'Sesiones', value: String(history.length) },
      ];

  const recent = history.slice(-CHART_POINTS);

  return (
    <Card>
      <Text style={[styles.meta, { color: theme.textMuted }]}>
        {history.length} {history.length === 1 ? 'sesión' : 'sesiones'} · última: {formatDate(last.date)}
      </Text>
      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
      {recent.length > 1 ? (
        <LineChart
          series={[
            {
              name: weighted ? '1RM estimado' : 'Máx. reps',
              color: theme.accent,
              points: recent.map((p) => ({
                label: shortDate(p.date),
                value: weighted ? kgToUnit(p.bestE1rmKg, unit) : p.bestReps,
              })),
            },
          ]}
        />
      ) : null}
      {onOpenProgress ? (
        <Button title="Ver progreso completo" variant="secondary" onPress={onOpenProgress} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  meta: { fontSize: 12 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 11 },
});
