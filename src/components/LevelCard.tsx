import { StyleSheet, Text, View } from 'react-native';

import { useHistoryStore } from '../store/useHistoryStore';
import { useTheme } from '../theme/useTheme';
import { rankProgress } from '../utils/military';
import { ProgressBar } from './ProgressBar';
import { Card } from './ui';

/** Rango militar actual y progreso hasta el siguiente, por puntos. */
export function LevelCard() {
  const theme = useTheme();
  const sessions = useHistoryStore((s) => s.sessions);
  const { current, next, points, progress } = rankProgress(sessions);

  return (
    <Card>
      <Text style={[styles.caption, { color: theme.textMuted }]}>Rango actual</Text>
      <Text style={[styles.level, { color: theme.accent }]}>{current.name}</Text>
      <ProgressBar progress={progress} />
      <View style={styles.row}>
        <Text style={[styles.meta, { color: theme.textMuted }]}>{points} puntos</Text>
        <Text style={[styles.meta, { color: theme.textMuted }]}>
          {next ? `Siguiente: ${next.name} (${next.minPoints})` : 'Rango máximo'}
        </Text>
      </View>
      <Text style={[styles.hint, { color: theme.textMuted }]}>
        Ganas puntos al completar programas: más difíciles, más puntos.
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  caption: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  level: { fontSize: 26, fontWeight: '800' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { fontSize: 12 },
  hint: { fontSize: 11 },
});
