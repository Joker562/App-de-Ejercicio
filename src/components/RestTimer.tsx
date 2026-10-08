import { StyleSheet, Text, View } from 'react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { useTheme } from '../theme/useTheme';
import { formatDuration } from '../utils/format';
import { useNow } from '../utils/useNow';
import { ProgressBar } from './ProgressBar';
import { Button } from './ui';

/**
 * Cuenta atrás de descanso. Se activa sola al marcar una serie de gimnasio
 * (ver useWorkoutStore.toggleSet); el aviso al terminar lo da WorkoutCues.
 */
export function RestTimer() {
  const theme = useTheme();
  const rest = useWorkoutStore((s) => s.rest);
  const extendRest = useWorkoutStore((s) => s.extendRest);
  const skipRest = useWorkoutStore((s) => s.skipRest);
  const now = useNow(rest !== null);

  // Sólo muestra la cuenta atrás: el aviso al terminar lo da WorkoutCues.
  const remainingSec = rest ? Math.max(0, (rest.endsAt - now) / 1000) : 0;

  if (!rest) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceAlt, borderColor: theme.accent }]}>
      <View style={styles.row}>
        <View>
          <Text style={[styles.label, { color: theme.textMuted }]}>Descanso</Text>
          <Text style={[styles.time, { color: theme.text }]}>
            {formatDuration(Math.ceil(remainingSec))}
          </Text>
        </View>
        <View style={styles.actions}>
          <Button title="+15 s" variant="secondary" onPress={() => extendRest(15)} />
          <Button title="Saltar" onPress={skipRest} />
        </View>
      </View>
      <ProgressBar progress={1 - remainingSec / rest.durationSec} color={theme.accent} height={6} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  time: { fontSize: 32, fontWeight: '800', fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: 8 },
});
