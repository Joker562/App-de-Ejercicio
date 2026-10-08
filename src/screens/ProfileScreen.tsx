import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { LevelCard } from '../components/LevelCard';
import { Button, Card, Screen, SectionTitle } from '../components/ui';
import { MILITARY_LEVELS } from '../data/data';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useTheme } from '../theme/useTheme';
import type { WeightUnit } from '../types';
import { confirmAction } from '../utils/dialogs';
import { formatDuration } from '../utils/format';
import { computeStreak, militaryLevelProgress } from '../utils/stats';

const UNITS: WeightUnit[] = ['kg', 'lbs'];
const REST_OPTIONS = [60, 90, 120, 180];

export function ProfileScreen() {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const setUnit = useAppStore((s) => s.setUnit);
  const defaultRestSec = useAppStore((s) => s.defaultRestSec);
  const setDefaultRestSec = useAppStore((s) => s.setDefaultRestSec);
  const autoRest = useAppStore((s) => s.autoRest);
  const setAutoRest = useAppStore((s) => s.setAutoRest);
  const sessions = useHistoryStore((s) => s.sessions);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const { current, completed } = militaryLevelProgress(sessions);
  const totalSec = sessions.reduce((sum, s) => sum + s.durationSec, 0);
  const stats = [
    { label: 'Sesiones totales', value: String(sessions.length) },
    { label: 'Tiempo entrenado', value: formatDuration(totalSec) },
    { label: 'Racha actual', value: `${computeStreak(sessions)} días` },
  ];

  const confirmClear = () =>
    confirmAction({
      title: 'Borrar historial',
      message: 'Se eliminarán todas las sesiones y tu rango volverá a Recluta.',
      confirmText: 'Borrar todo',
      destructive: true,
      onConfirm: clearHistory,
    });

  return (
    <Screen>
      <LevelCard />

      <Card>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statRow}>
            <Text style={{ color: theme.textMuted }}>{stat.label}</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
          </View>
        ))}
      </Card>

      <SectionTitle>Rangos</SectionTitle>
      <Card>
        {MILITARY_LEVELS.map((level) => {
          const reached = level.minSessions <= completed;
          return (
            <View key={level.id} style={styles.statRow}>
              <Text
                style={{
                  color: level.id === current.id ? theme.accent : reached ? theme.text : theme.textMuted,
                  fontWeight: level.id === current.id ? '800' : '400',
                }}
              >
                {level.name}
              </Text>
              <Text style={{ color: theme.textMuted }}>{level.minSessions} sesiones</Text>
            </View>
          );
        })}
      </Card>

      <SectionTitle>Unidad de peso</SectionTitle>
      <View style={[styles.segment, { borderColor: theme.border }]}>
        {UNITS.map((u) => {
          const selected = u === unit;
          return (
            <Pressable
              key={u}
              onPress={() => setUnit(u)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.segmentItem, { backgroundColor: selected ? theme.primary : theme.surface }]}
            >
              <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '700' }}>
                {u}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>Descanso entre series</SectionTitle>
      <Card>
        <View style={styles.statRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Descanso automático</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
              Empieza la cuenta atrás al marcar una serie
            </Text>
          </View>
          <Switch
            value={autoRest}
            onValueChange={setAutoRest}
            trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
            accessibilityLabel="Descanso automático"
          />
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 4 }}>
          Descanso por defecto para ejercicios nuevos
        </Text>
        <View style={[styles.segment, { borderColor: theme.border }]}>
          {REST_OPTIONS.map((seconds) => {
            const selected = seconds === defaultRestSec;
            return (
              <Pressable
                key={seconds}
                onPress={() => setDefaultRestSec(seconds)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.segmentItem, { backgroundColor: selected ? theme.primary : theme.surface }]}
              >
                <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '700' }}>
                  {formatDuration(seconds)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <SectionTitle>Datos</SectionTitle>
      <Button title="Borrar historial" variant="danger" onPress={confirmClear} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  statValue: { fontWeight: '700', fontVariant: ['tabular-nums'] },
  segment: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
});
