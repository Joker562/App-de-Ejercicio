import { Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { LevelCard } from '../components/LevelCard';
import { Button, Card, Screen, SectionTitle } from '../components/ui';
import { MILITARY_LEVELS } from '../data/data';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useTheme } from '../theme/useTheme';
import type { Sex, WeightUnit } from '../types';
import { confirmAction } from '../utils/dialogs';
import { formatDuration } from '../utils/format';
import { rankProgress } from '../utils/military';
import { computeStreak } from '../utils/stats';

const UNITS: WeightUnit[] = ['kg', 'lbs'];
const REST_OPTIONS = [60, 90, 120, 180];
const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
];

export function ProfileScreen() {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const setUnit = useAppStore((s) => s.setUnit);
  const defaultRestSec = useAppStore((s) => s.defaultRestSec);
  const setDefaultRestSec = useAppStore((s) => s.setDefaultRestSec);
  const autoRest = useAppStore((s) => s.autoRest);
  const setAutoRest = useAppStore((s) => s.setAutoRest);
  const voiceCues = useAppStore((s) => s.voiceCues);
  const setVoiceCues = useAppStore((s) => s.setVoiceCues);
  const age = useAppStore((s) => s.age);
  const sex = useAppStore((s) => s.sex);
  const setProfile = useAppStore((s) => s.setProfile);
  const sessions = useHistoryStore((s) => s.sessions);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const { current, points } = rankProgress(sessions);
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
          const reached = level.minPoints <= points;
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
              <Text style={{ color: theme.textMuted }}>{level.minPoints} puntos</Text>
            </View>
          );
        })}
      </Card>

      <SectionTitle>Datos para la prueba física</SectionTitle>
      <Card>
        <View style={styles.statRow}>
          <Text style={{ color: theme.text, fontWeight: '600' }}>Edad</Text>
          <TextInput
            value={age ? String(age) : ''}
            onChangeText={(text) => {
              const value = parseInt(text, 10);
              setProfile({ age: Number.isFinite(value) ? value : undefined });
            }}
            keyboardType="number-pad"
            placeholder="años"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel="Edad"
            style={[styles.ageInput, { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
          />
        </View>
        <View style={[styles.segment, { borderColor: theme.border }]}>
          {SEX_OPTIONS.map((option) => {
            const selected = option.value === sex;
            return (
              <Pressable
                key={option.value}
                onPress={() => setProfile({ sex: option.value })}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[styles.segmentItem, { backgroundColor: selected ? theme.primary : theme.surface }]}
              >
                <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '700' }}>
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={{ color: theme.textMuted, fontSize: 12 }}>
          La nota de la prueba física depende de la edad y el sexo (tablas de la APFT).
        </Text>
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

      <SectionTitle>Temporizadores</SectionTitle>
      <Card>
        <View style={styles.statRow}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontWeight: '600' }}>Avisos de voz</Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>
              Cuenta atrás "3, 2, 1" y cambios de fase en voz alta
            </Text>
          </View>
          <Switch
            value={voiceCues}
            onValueChange={setVoiceCues}
            trackColor={{ true: theme.primary, false: theme.surfaceAlt }}
            accessibilityLabel="Avisos de voz"
          />
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
  ageInput: { width: 80, borderWidth: 1, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, textAlign: 'center', fontSize: 16 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
});
