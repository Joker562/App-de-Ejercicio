import { StyleSheet, Text, View } from 'react-native';

import { ProgressChart } from '../components/ProgressChart';
import { Card, ListItem, Screen, SectionTitle } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { MODE_LABELS } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import type { Session } from '../types';
import { confirmAction } from '../utils/dialogs';
import { formatDate, formatDuration, kgToUnit } from '../utils/format';
import { completedSetCount, exerciseRecords, sessionVolumeKg } from '../utils/stats';

const CHART_SESSIONS = 8;

function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/** Historial del modo activo: gráfico de progreso, récords y sesiones. */
export function HistoryScreen() {
  const theme = useTheme();
  const mode = useAppStore((s) => s.mode);
  const unit = useAppStore((s) => s.unit);
  const allSessions = useHistoryStore((s) => s.sessions);
  const removeSession = useHistoryStore((s) => s.removeSession);

  const sessions = allSessions.filter((s) => s.mode === mode);
  const recent = sessions.slice(0, CHART_SESSIONS).reverse();
  const isGym = mode === 'gym';

  const chartData = recent.map((s) => ({
    label: shortDate(s.endedAt),
    value: isGym ? kgToUnit(sessionVolumeKg(s), unit) : completedSetCount(s) || s.roundsCompleted,
  }));
  const records = isGym ? exerciseRecords(sessions) : [];

  const sessionSubtitle = (s: Session) => {
    const parts = [formatDate(s.endedAt), formatDuration(s.durationSec)];
    if (isGym) parts.push(`${Math.round(kgToUnit(sessionVolumeKg(s), unit))} ${unit}`);
    else if (s.roundsCompleted > 0) parts.push(`${s.roundsCompleted} rondas`);
    else parts.push(`${completedSetCount(s)} series`);
    return parts.join(' · ');
  };

  const confirmDelete = (s: Session) =>
    confirmAction({
      title: 'Eliminar sesión',
      message: `¿Eliminar "${s.title}" del historial?`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => removeSession(s.id),
    });

  return (
    <Screen>
      <Text style={[styles.mode, { color: theme.accent }]}>{MODE_LABELS[mode]}</Text>

      <Card>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {isGym ? `Volumen por sesión (${unit})` : 'Series o rondas por sesión'}
        </Text>
        <ProgressChart data={chartData} />
      </Card>

      {isGym ? (
        <>
          <SectionTitle>1RM estimado (Epley)</SectionTitle>
          {records.length === 0 ? (
            <Text style={[styles.empty, { color: theme.textMuted }]}>
              Completa series con peso para ver tus récords.
            </Text>
          ) : (
            <Card>
              {records.map((r) => (
                <View key={r.exerciseId} style={styles.recordRow}>
                  <Text style={[styles.recordName, { color: theme.text }]}>{r.name}</Text>
                  <Text style={[styles.recordValue, { color: theme.accent }]}>
                    {kgToUnit(r.bestOneRepMaxKg, unit)} {unit}
                  </Text>
                  <Text style={[styles.recordMax, { color: theme.textMuted }]}>
                    máx. {kgToUnit(r.maxWeightKg, unit)}
                  </Text>
                </View>
              ))}
            </Card>
          )}
        </>
      ) : null}

      <SectionTitle>Sesiones ({sessions.length})</SectionTitle>
      {sessions.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          Aún no hay sesiones en este modo.
        </Text>
      ) : (
        sessions.map((s) => (
          <ListItem
            key={s.id}
            title={s.title}
            subtitle={sessionSubtitle(s)}
            onPress={() => confirmDelete(s)}
          />
        ))
      )}
      {sessions.length > 0 ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Toca una sesión para eliminarla.
        </Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mode: { fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', paddingVertical: 16 },
  recordRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, paddingVertical: 4 },
  recordName: { flex: 1, fontSize: 15 },
  recordValue: { fontSize: 16, fontWeight: '800', fontVariant: ['tabular-nums'] },
  recordMax: { fontSize: 12, minWidth: 64, textAlign: 'right' },
  hint: { fontSize: 12, textAlign: 'center' },
});
