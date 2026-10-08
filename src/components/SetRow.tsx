import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
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
  // Mientras se escribe no se re-sincroniza desde el store, para no pisar
  // estados intermedios como "80," o "22.5" en lbs.
  const editing = useRef<'reps' | 'weight' | null>(null);

  useEffect(() => {
    if (editing.current !== 'reps') setReps(String(set.reps || ''));
  }, [set.reps]);
  useEffect(() => {
    if (editing.current !== 'weight') {
      setWeight(set.weightKg ? String(kgToUnit(set.weightKg, unit)) : '');
    }
  }, [set.weightKg, unit]);

  // Se guarda en cada pulsación: en el móvil, tocar "Terminar" o el check con
  // el teclado abierto no quita el foco, y un guardado sólo en onBlur perdía el valor.
  const changeReps = (text: string) => {
    setReps(text);
    const value = parseInt(text, 10);
    updateSet(exerciseId, set.id, { reps: Number.isFinite(value) ? value : 0 });
  };
  const changeWeight = (text: string) => {
    setWeight(text);
    const value = parseFloat(text.replace(',', '.'));
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
            onChangeText={changeReps}
            onFocus={() => (editing.current = 'reps')}
            onBlur={() => (editing.current = null)}
            keyboardType="number-pad"
            placeholder="reps"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Repeticiones serie ${index + 1}`}
          />
          <TextInput
            style={inputStyle}
            value={weight}
            onChangeText={changeWeight}
            onFocus={() => (editing.current = 'weight')}
            onBlur={() => (editing.current = null)}
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
