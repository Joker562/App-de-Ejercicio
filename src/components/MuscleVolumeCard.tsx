import { StyleSheet, Text, View } from 'react-native';

import { MUSCLE_GROUPS } from '../data/data';
import { useTheme } from '../theme/useTheme';
import type { Session, TrainingMode } from '../types';
import { setsByMuscleGroup } from '../utils/records';
import { Card } from './ui';

/** Rango orientativo de series semanales por grupo para hipertrofia. */
const TARGET = { min: 10, max: 20 };

/**
 * Series efectivas por grupo muscular en los últimos 7 días. En gimnasio
 * marca el rango recomendado para detectar grupos olvidados o sobrecargados.
 */
export function MuscleVolumeCard({ sessions, mode }: { sessions: Session[]; mode: TrainingMode }) {
  const theme = useTheme();
  const totals = setsByMuscleGroup(sessions, mode);
  const scaleMax = Math.max(TARGET.max + 4, ...Object.values(totals));
  const isGym = mode === 'gym';

  return (
    <Card>
      <Text style={[styles.title, { color: theme.text }]}>Series por grupo muscular (7 días)</Text>
      {MUSCLE_GROUPS.map((group) => {
        const sets = totals[group];
        // Cuello es un grupo menor: sólo se muestra si se ha entrenado.
        if (group === 'Cuello' && sets === 0) return null;
        const inRange = sets >= TARGET.min && sets <= TARGET.max;
        const color = !isGym ? theme.primary : inRange ? theme.success : sets > TARGET.max ? theme.danger : theme.accent;
        return (
          <View key={group} style={styles.row}>
            <Text style={[styles.group, { color: theme.text }]}>{group}</Text>
            <View style={[styles.track, { backgroundColor: theme.surfaceAlt }]}>
              {isGym ? (
                <View
                  style={[
                    styles.targetZone,
                    {
                      left: `${(TARGET.min / scaleMax) * 100}%`,
                      width: `${((TARGET.max - TARGET.min) / scaleMax) * 100}%`,
                      borderColor: theme.success,
                    },
                  ]}
                />
              ) : null}
              <View
                style={[styles.bar, { width: `${(sets / scaleMax) * 100}%`, backgroundColor: color }]}
              />
            </View>
            <Text style={[styles.count, { color: theme.textMuted }]}>{sets}</Text>
          </View>
        );
      })}
      {isGym ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Zona marcada: {TARGET.min}-{TARGET.max} series semanales, un rango habitual para ganar
          músculo. Los calentamientos no cuentan.
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  group: { width: 64, fontSize: 13 },
  track: { flex: 1, height: 12, borderRadius: 6, overflow: 'hidden' },
  targetZone: { position: 'absolute', top: 0, bottom: 0, borderLeftWidth: 1, borderRightWidth: 1, opacity: 0.8 },
  bar: { height: '100%', borderRadius: 6 },
  count: { width: 24, textAlign: 'right', fontSize: 13, fontVariant: ['tabular-nums'] },
  hint: { fontSize: 11 },
});
