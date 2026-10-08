import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IntervalTimer } from '../../components/IntervalTimer';
import { Screen, SectionTitle } from '../../components/ui';
import { useTheme } from '../../theme/useTheme';
import type { TimerConfig } from '../../types';
import { useLocalClock, type ClockControls } from '../../utils/clock';
import { describeTimer, pendingAlerts } from '../../utils/intervals';
import { cancelAlerts, scheduleAlerts } from '../../utils/notifications';
import { useKeepScreenOn } from '../../utils/useKeepScreenOn';

const PRESETS: TimerConfig[] = [
  { type: 'amrap', durationSec: 10 * 60 },
  { type: 'amrap', durationSec: 20 * 60 },
  { type: 'emom', minutes: 10 },
  { type: 'emom', minutes: 20 },
  { type: 'tabata', workSec: 20, restSec: 10, rounds: 8 },
  { type: 'tabata', workSec: 40, restSec: 20, rounds: 10 },
];

/** Temporizadores libres, fuera de un programa. */
export function TimerScreen() {
  const theme = useTheme();
  const [selected, setSelected] = useState(0);
  const [clock, controls] = useLocalClock();
  const [rounds, setRounds] = useState(0);
  const config = PRESETS[selected];
  useKeepScreenOn('free-timer');

  // Al salir de la pantalla el reloj local desaparece: cancela sus avisos.
  useEffect(() => () => cancelAlerts('free-timer'), []);

  // Mismos controles, pero programando/cancelando los avisos de cada fase.
  const timerControls: ClockControls = {
    start: () => {
      controls.start();
      scheduleAlerts('free-timer', pendingAlerts(config, clock.accumulatedMs / 1000));
    },
    pause: () => {
      controls.pause();
      cancelAlerts('free-timer');
    },
    reset: () => {
      controls.reset();
      setRounds(0);
      cancelAlerts('free-timer');
    },
  };

  const select = (index: number) => {
    timerControls.reset();
    setSelected(index);
  };

  return (
    <Screen>
      <SectionTitle>Elige un formato</SectionTitle>
      <View style={styles.chips}>
        {PRESETS.map((preset, i) => {
          const isSelected = i === selected;
          return (
            <Pressable
              key={describeTimer(preset)}
              onPress={() => select(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={{ color: isSelected ? theme.onPrimary : theme.text, fontWeight: '600' }}>
                {describeTimer(preset)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <IntervalTimer
        key={selected}
        config={config}
        clock={clock}
        controls={timerControls}
        rounds={rounds}
        onAddRound={() => setRounds((r) => r + 1)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
});
