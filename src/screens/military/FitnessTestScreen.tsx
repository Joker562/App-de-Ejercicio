import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { IntervalTimer } from '../../components/IntervalTimer';
import { ProgressBar } from '../../components/ProgressBar';
import { Button, Card, Screen, SectionTitle } from '../../components/ui';
import type { DashboardScreenProps } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useTheme } from '../../theme/useTheme';
import type { Sex, TimerConfig } from '../../types';
import { clockElapsedMs, useLocalClock } from '../../utils/clock';
import { notify } from '../../utils/dialogs';
import { formatDuration, parseDuration } from '../../utils/format';
import { PASS_SCORE, fitnessTestTargets, scoreFitnessTest } from '../../utils/military';
import { useKeepScreenOn } from '../../utils/useKeepScreenOn';
import { useNow } from '../../utils/useNow';

const TWO_MINUTES: TimerConfig = { type: 'amrap', durationSec: 120 };

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
];

/**
 * Prueba física: flexiones y abdominales en 2 minutos y carrera de 3.2 km.
 * La nota es una estimación basada en las tablas históricas de la APFT.
 */
export function FitnessTestScreen({ navigation }: DashboardScreenProps<'FitnessTest'>) {
  const theme = useTheme();
  const age = useAppStore((s) => s.age);
  const sex = useAppStore((s) => s.sex);
  const setProfile = useAppStore((s) => s.setProfile);
  const recordFitnessTest = useWorkoutStore((s) => s.recordFitnessTest);
  useKeepScreenOn('fitness-test');

  const startedAt = useRef(Date.now()).current;
  const [pushupsText, setPushupsText] = useState('');
  const [situpsText, setSitupsText] = useState('');
  const [runText, setRunText] = useState('');
  const [pushupClock, pushupControls] = useLocalClock();
  const [situpClock, situpControls] = useLocalClock();
  const [runClock, runControls] = useLocalClock();
  const now = useNow(runClock.running, 500);

  const pushups = parseInt(pushupsText, 10) || 0;
  const situps = parseInt(situpsText, 10) || 0;
  const runSec = parseDuration(runText) ?? 0;
  const profileReady = !!age && age >= 17 && !!sex;
  const result = profileReady ? scoreFitnessTest({ pushups, situps, runSec, age, sex }) : null;
  const targets = profileReady ? fitnessTestTargets(age, sex) : null;

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  ];

  const stopRun = () => {
    runControls.pause();
    setRunText(formatDuration(clockElapsedMs(runClock, Date.now()) / 1000));
  };

  const save = () => {
    if (!result) return;
    if (pushups === 0 && situps === 0 && runSec === 0) {
      notify('Sin resultados', 'Registra al menos una prueba antes de guardar.');
      return;
    }
    const session = recordFitnessTest(result, startedAt);
    navigation.popToTop();
    navigation.navigate('Historial', {
      screen: 'SessionDetail',
      params: { sessionId: session.id },
      initial: false,
    });
  };

  const scoreLine = (score: number) => (
    <View style={styles.scoreRow}>
      <View style={{ flex: 1 }}>
        <ProgressBar progress={score / 100} color={score >= PASS_SCORE ? theme.success : theme.danger} />
      </View>
      <Text style={[styles.score, { color: score >= PASS_SCORE ? theme.success : theme.danger }]}>
        {score} pts
      </Text>
    </View>
  );

  return (
    <Screen>
      {!profileReady ? (
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Tus datos</Text>
          <Text style={{ color: theme.textMuted }}>
            La nota depende de la edad y el sexo. Se guardan en Perfil.
          </Text>
          <View style={styles.profileRow}>
            <TextInput
              value={age ? String(age) : ''}
              onChangeText={(text) => {
                const value = parseInt(text, 10);
                setProfile({ age: Number.isFinite(value) ? value : undefined });
              }}
              keyboardType="number-pad"
              placeholder="Edad"
              placeholderTextColor={theme.textMuted}
              style={[inputStyle, styles.ageInput]}
              accessibilityLabel="Edad"
            />
            {SEX_OPTIONS.map((option) => {
              const selected = option.value === sex;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => setProfile({ sex: option.value })}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selected ? theme.primary : theme.surface,
                      borderColor: selected ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '700' }}>
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {age !== undefined && age < 17 ? (
            <Text style={{ color: theme.danger }}>Las tablas empiezan a los 17 años.</Text>
          ) : null}
        </Card>
      ) : (
        <Card>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Objetivos para tu edad</Text>
          <Text style={{ color: theme.textMuted }}>
            Aprobar (60 pts): {targets!.pushups.min} flexiones · {targets!.situps.min} abdominales ·{' '}
            {formatDuration(targets!.run.min)}
          </Text>
          <Text style={{ color: theme.textMuted }}>
            Máximo (100 pts): {targets!.pushups.max} flexiones · {targets!.situps.max} abdominales ·{' '}
            {formatDuration(targets!.run.max)}
          </Text>
        </Card>
      )}

      <SectionTitle>1 · Flexiones (2 minutos)</SectionTitle>
      <IntervalTimer config={TWO_MINUTES} clock={pushupClock} controls={pushupControls} />
      <TextInput
        value={pushupsText}
        onChangeText={setPushupsText}
        keyboardType="number-pad"
        placeholder="Flexiones hechas"
        placeholderTextColor={theme.textMuted}
        style={inputStyle}
        accessibilityLabel="Flexiones hechas"
      />
      {result ? scoreLine(result.scores.pushups) : null}

      <SectionTitle>2 · Abdominales (2 minutos)</SectionTitle>
      <IntervalTimer config={TWO_MINUTES} clock={situpClock} controls={situpControls} />
      <TextInput
        value={situpsText}
        onChangeText={setSitupsText}
        keyboardType="number-pad"
        placeholder="Abdominales hechos"
        placeholderTextColor={theme.textMuted}
        style={inputStyle}
        accessibilityLabel="Abdominales hechos"
      />
      {result ? scoreLine(result.scores.situps) : null}

      <SectionTitle>3 · Carrera de 3.2 km</SectionTitle>
      <Card>
        <Text style={[styles.stopwatch, { color: theme.text }]}>
          {formatDuration(clockElapsedMs(runClock, now) / 1000)}
        </Text>
        <View style={styles.actions}>
          {runClock.running ? (
            <Button title="Parar" onPress={stopRun} style={styles.flex} />
          ) : (
            <Button
              title={runClock.accumulatedMs > 0 ? 'Reanudar' : 'Iniciar cronómetro'}
              onPress={runControls.start}
              style={styles.flex}
            />
          )}
          {runClock.accumulatedMs > 0 && !runClock.running ? (
            <Button title="Reiniciar" variant="secondary" onPress={runControls.reset} style={styles.flex} />
          ) : null}
        </View>
      </Card>
      <TextInput
        value={runText}
        onChangeText={setRunText}
        keyboardType="numbers-and-punctuation"
        placeholder="Tiempo (mm:ss)"
        placeholderTextColor={theme.textMuted}
        style={inputStyle}
        accessibilityLabel="Tiempo de carrera"
      />
      {result && runSec > 0 ? scoreLine(result.scores.run) : null}

      {result ? (
        <Card>
          <Text style={[styles.total, { color: theme.text }]}>{result.scores.total} / 300</Text>
          <Text
            style={[styles.verdict, { color: result.passed ? theme.success : theme.danger }]}
          >
            {result.passed ? 'APROBADO' : 'NO APROBADO'} · mínimo 60 en cada prueba
          </Text>
          <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
            Estimación basada en las tablas históricas de la APFT (ejército de EE. UU.), no
            oficial.
          </Text>
        </Card>
      ) : null}

      <Button title="Guardar resultado" onPress={save} disabled={!profileReady} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: { fontSize: 16, fontWeight: '700' },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ageInput: { width: 90 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 18 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  score: { width: 64, textAlign: 'right', fontWeight: '800', fontVariant: ['tabular-nums'] },
  stopwatch: { fontSize: 48, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
  total: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  verdict: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  disclaimer: { fontSize: 11, textAlign: 'center' },
});
