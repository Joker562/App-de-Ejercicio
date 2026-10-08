import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { MODE_LABELS, PALETTES } from '../theme/palettes';
import type { TrainingMode } from '../types';

const MODES: { mode: TrainingMode; subtitle: string }[] = [
  { mode: 'military', subtitle: 'Calistenia, resistencia y disciplina' },
  { mode: 'gym', subtitle: 'Hipertrofia, fuerza y progreso' },
];

/**
 * Selector de modo con dos botones grandes. Cada botón usa la paleta de su
 * propio modo, así se ve el tema al que se va a cambiar.
 */
export function ModeSelector() {
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {MODES.map((item) => {
        const palette = PALETTES[item.mode];
        const selected = item.mode === mode;
        return (
          <Pressable
            key={item.mode}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => setMode(item.mode)}
            style={[
              styles.option,
              {
                backgroundColor: selected ? palette.primary : palette.surface,
                borderColor: selected ? palette.accent : palette.border,
              },
            ]}
          >
            <Text
              style={[
                styles.title,
                { color: selected ? palette.onPrimary : palette.text },
              ]}
            >
              {MODE_LABELS[item.mode]}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: selected ? palette.onPrimary : palette.textMuted },
              ]}
            >
              {item.subtitle}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  option: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    paddingVertical: 20,
    paddingHorizontal: 14,
    gap: 6,
  },
  title: { fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12, lineHeight: 16 },
});
