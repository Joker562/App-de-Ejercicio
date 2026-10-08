import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useTheme } from '../theme/useTheme';
import type { TrainingMode, WorkoutSet } from '../types';
import { kgToUnit, unitToKg } from '../utils/format';

interface Props {
  exerciseId: string;
  set: WorkoutSet;
  index: number;
  mode: TrainingMode;
}

/**
 * Fila de una serie. En modo militar es sólo un checkbox; en gimnasio añade
 * inputs de repeticiones y peso (mostrado en la unidad del usuario).
 */
export function SetRow({ exerciseId, set, index, mode }: Props) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const toggleSet = useWorkoutStore((s) => s.toggleSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);

  const [reps, setReps] = useState(String(set.reps || ''));
  const [weight, setWeight] = useState(set.weightKg ? String(kgToUnit(set.weightKg, unit)) : '');

  // Re-sincroniza si cambia la unidad o el valor guardado desde fuera.
  useEffect(() => setReps(String(set.reps || '')), [set.reps]);
  useEffect(
    () => setWeight(set.weightKg ? String(kgToUnit(set.weightKg, unit)) : ''),
    [set.weightKg, unit],
  );

  const commitReps = () => {
    const value = parseInt(reps, 10);
    updateSet(exerciseId, set.id, { reps: Number.isFinite(value) ? value : 0 });
  };
  const commitWeight = () => {
    const value = parseFloat(weight.replace(',', '.'));
    updateSet(exerciseId, set.id, {
      weightKg: Number.isFinite(value) ? unitToKg(value, unit) : 0,
    });
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  ];

  return (
    <View
      style={[
        styles.row,
        set.completed && { backgroundColor: theme.surfaceAlt },
      ]}
    >
      <Text style={[styles.index, { color: theme.textMuted }]}>
        {mode === 'military' ? `Serie ${index + 1}` : index + 1}
      </Text>

      {mode === 'gym' ? (
        <>
          <TextInput
            style={inputStyle}
            value={reps}
            onChangeText={setReps}
            onBlur={commitReps}
            keyboardType="number-pad"
            placeholder="reps"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Repeticiones serie ${index + 1}`}
          />
          <TextInput
            style={inputStyle}
            value={weight}
            onChangeText={setWeight}
            onBlur={commitWeight}
            keyboardType="decimal-pad"
            placeholder={unit}
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Peso serie ${index + 1} en ${unit}`}
          />
          <Pressable
            onPress={() => removeSet(exerciseId, set.id)}
            hitSlop={8}
            accessibilityLabel={`Eliminar serie ${index + 1}`}
          >
            <Ionicons name="close" size={18} color={theme.textMuted} />
          </Pressable>
        </>
      ) : (
        <View style={styles.spacer} />
      )}

      <Pressable
        onPress={() => toggleSet(exerciseId, set.id)}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: set.completed }}
        accessibilityLabel={`Completar serie ${index + 1}`}
        style={[
          styles.checkbox,
          {
            borderColor: set.completed ? theme.success : theme.border,
            backgroundColor: set.completed ? theme.success : 'transparent',
          },
        ]}
      >
        {set.completed ? <Ionicons name="checkmark" size={20} color={theme.onPrimary} /> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  index: { minWidth: 28, fontWeight: '700', fontVariant: ['tabular-nums'] },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  spacer: { flex: 1 },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
