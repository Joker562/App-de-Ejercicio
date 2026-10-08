import { StyleSheet, Text, View } from 'react-native';

import { useHistoryStore } from '../store/useHistoryStore';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/useTheme';
import { kgToUnit } from '../utils/format';
import { computeStreak, weeklySummary } from '../utils/stats';
import { Card } from './ui';

const DAY_LABELS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

/** Resumen semanal del modo activo y racha global de días activos. */
export function WeeklySummary() {
  const theme = useTheme();
  const sessions = useHistoryStore((s) => s.sessions);
  const mode = useAppStore((s) => s.mode);
  const unit = useAppStore((s) => s.unit);

  const summary = weeklySummary(sessions, mode);
  const streak = computeStreak(sessions);

  const stats = [
    { label: 'Sesiones', value: String(summary.sessions) },
    { label: 'Minutos', value: String(summary.minutes) },
    mode === 'gym'
      ? { label: `Volumen (${unit})`, value: String(Math.round(kgToUnit(summary.volumeKg, unit))) }
      : { label: 'Series', value: String(summary.completedSets) },
  ];

  return (
    <Card>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Esta semana</Text>
        <View style={[styles.streak, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={[styles.streakText, { color: theme.accent }]}>
            Racha: {streak} {streak === 1 ? 'día' : 'días'}
          </Text>
        </View>
      </View>

      <View style={styles.days}>
        {summary.activeDays.map((active, i) => (
          <View key={DAY_LABELS[i]} style={styles.day}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: active ? theme.primary : theme.surfaceAlt,
                  borderColor: active ? theme.accent : theme.border,
                },
              ]}
            />
            <Text style={[styles.dayLabel, { color: theme.textMuted }]}>{DAY_LABELS[i]}</Text>
          </View>
        ))}
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700' },
  streak: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  streakText: { fontSize: 13, fontWeight: '700' },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  day: { alignItems: 'center', gap: 4 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 1 },
  dayLabel: { fontSize: 12 },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12 },
});
