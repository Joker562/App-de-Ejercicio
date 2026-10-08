import { useEffect, useRef } from 'react';
import { StyleSheet, Text, Vibration, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { TimerConfig } from '../types';
import { clockElapsedMs, type ClockControls, type ClockState } from '../utils/clock';
import { formatDuration } from '../utils/format';
import { describeTimer, intervalPhase } from '../utils/intervals';
import { useNow } from '../utils/useNow';
import { ProgressBar } from './ProgressBar';
import { Button, Card } from './ui';

interface Props {
  config: TimerConfig;
  clock: ClockState;
  controls: ClockControls;
  /** Sólo AMRAP: rondas contadas y acción para sumar una. */
  rounds?: number;
  onAddRound?: () => void;
}

/** Motor visual de AMRAP, EMOM y Tabata. Vibra en cada cambio de fase. */
export function IntervalTimer({ config, clock, controls, rounds, onAddRound }: Props) {
  const theme = useTheme();
  const now = useNow(clock.running);
  const phase = intervalPhase(config, clockElapsedMs(clock, now));

  const lastPhaseKey = useRef(phase.key);
  useEffect(() => {
    if (phase.key === lastPhaseKey.current) return;
    lastPhaseKey.current = phase.key;
    if (!clock.running) return;
    Vibration.vibrate(phase.done ? [0, 400, 200, 400] : 300);
    if (phase.done) controls.pause();
  }, [phase.key, phase.done, clock.running, controls]);

  const phaseColor = phase.isRest ? theme.accent : theme.primary;
  const started = clock.running || clock.accumulatedMs > 0;

  return (
    <Card>
      <Text style={[styles.kind, { color: theme.textMuted }]}>{describeTimer(config)}</Text>
      <Text style={[styles.label, { color: phaseColor }]}>{phase.label}</Text>
      <Text style={[styles.time, { color: theme.text }]}>
        {formatDuration(Math.ceil(phase.remainingSec))}
      </Text>
      <ProgressBar progress={phase.phaseProgress} color={phaseColor} />
      {config.type !== 'amrap' ? (
        <Text style={[styles.total, { color: theme.textMuted }]}>
          Total restante {formatDuration(Math.ceil(phase.totalRemainingSec))}
        </Text>
      ) : null}

      {config.type === 'amrap' && onAddRound ? (
        <View style={styles.rounds}>
          <Text style={[styles.roundsText, { color: theme.text }]}>
            Rondas: <Text style={{ fontWeight: '800' }}>{rounds ?? 0}</Text>
          </Text>
          <Button title="+1 ronda" onPress={onAddRound} disabled={!clock.running} />
        </View>
      ) : null}

      <View style={styles.controls}>
        {phase.done ? null : clock.running ? (
          <Button title="Pausar" variant="secondary" onPress={controls.pause} style={styles.flex} />
        ) : (
          <Button
            title={started ? 'Reanudar' : 'Iniciar'}
            onPress={controls.start}
            style={styles.flex}
          />
        )}
        {started ? (
          <Button title="Reiniciar" variant="secondary" onPress={controls.reset} style={styles.flex} />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  kind: { fontSize: 13, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  label: { fontSize: 18, fontWeight: '700' },
  time: {
    fontSize: 64,
    fontWeight: '800',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  total: { fontSize: 13, textAlign: 'center' },
  rounds: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  roundsText: { fontSize: 18 },
  controls: { flexDirection: 'row', gap: 12, marginTop: 4 },
  flex: { flex: 1 },
});
