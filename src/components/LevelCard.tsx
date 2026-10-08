import { StyleSheet, Text, View } from 'react-native';

import { useHistoryStore } from '../store/useHistoryStore';
import { useTheme } from '../theme/useTheme';
import { militaryLevelProgress } from '../utils/stats';
import { ProgressBar } from './ProgressBar';
import { Card } from './ui';

/** Rango militar actual y progreso hasta el siguiente. */
export function LevelCard() {
  const theme = useTheme();
  const sessions = useHistoryStore((s) => s.sessions);
  const { current, next, completed, progress } = militaryLevelProgress(sessions);

  return (
    <Card>
      <Text style={[styles.caption, { color: theme.textMuted }]}>Rango actual</Text>
      <Text style={[styles.level, { color: theme.accent }]}>{current.name}</Text>
      <ProgressBar progress={progress} />
      <View style={styles.row}>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {completed} {completed === 1 ? 'sesión completada' : 'sesiones completadas'}
        </Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {next ? `Siguiente: ${next.name} (${next.minSessions})` : 'Rango máximo'}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  level: { fontSize: 26, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 12 },
});
