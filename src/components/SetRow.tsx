import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import type { Palette } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import type { PreviousSet, SetType, TrainingMode, WorkoutSet } from '../types';
import { formatDuration, kgToUnit, parseDuration, unitToKg } from '../utils/format';

interface Props {
  exerciseId: string;
  set: WorkoutSet;
  /** Número a mostrar (las series de calentamiento no cuentan). */
  label: string;
  mode: TrainingMode;
  /** Serie equivalente de la última sesión, para la columna "Anterior". */
  previous?: PreviousSet;
  /** Militar: qué se registra además del check. */
  measure?: 'reps' | 'time';
}

export const SET_TYPE_LABELS: Record<SetType, string> = {
  normal: 'Normal',
  warmup: 'Calentamiento',
  drop: 'Dropset',
  failure: 'Al fallo',
};

const SET_TYPE_SHORT: Record<SetType, string> = { normal: '', warmup: 'C', drop: 'D', failure: 'F' };
const RPE_OPTIONS = [6, 7, 8, 9, 10];

export function setTypeColor(type: SetType, theme: Palette): string {
  return { normal: theme.textMuted, warmup: theme.accent, drop: theme.primary, failure: theme.danger }[type];
}

/**
 * Fila de una serie. En modo militar es sólo un checkbox; en gimnasio añade
 * la serie anterior, reps y peso (en la unidad del usuario). Tocar el número
 * abre el tipo de serie y el RPE.
 */
export function SetRow({ exerciseId, set, label, mode, previous, measure = 'reps' }: Props) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const toggleSet = useWorkoutStore((s) => s.toggleSet);
  const updateSet = useWorkoutStore((s) => s.updateSet);
  const removeSet = useWorkoutStore((s) => s.removeSet);
  const [expanded, setExpanded] = useState(false);

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

  // Militar con medida de tiempo (carrera, plancha): "mm:ss" o segundos.
  const [timeText, setTimeText] = useState(set.durationSec ? formatDuration(set.durationSec) : '');
  const changeTime = (text: string) => {
    setTimeText(text);
    const seconds = parseDuration(text);
    updateSet(exerciseId, set.id, { durationSec: seconds ?? undefined });
  };

  const type = set.type ?? 'normal';
  const typeColor = setTypeColor(type, theme);
  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  ];

  const checkbox = (
    <Pressable
      onPress={() => toggleSet(exerciseId, set.id)}
      hitSlop={8}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: set.completed }}
      accessibilityLabel={`Completar serie ${label}`}
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
  );

  if (mode === 'military') {
    return (
      <View style={[styles.row, set.completed && { backgroundColor: theme.surfaceAlt }]}>
        <Text style={[styles.militaryLabel, { color: theme.textMuted }]}>Serie {label}</Text>
        {measure === 'time' ? (
          <TextInput
            style={[inputStyle, styles.militaryInput]}
            value={timeText}
            onChangeText={changeTime}
            keyboardType="numbers-and-punctuation"
            placeholder="mm:ss"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Tiempo serie ${label}`}
          />
        ) : (
          <TextInput
            style={[inputStyle, styles.militaryInput]}
            value={reps}
            onChangeText={changeReps}
            onFocus={() => (editing.current = 'reps')}
            onBlur={() => (editing.current = null)}
            keyboardType="number-pad"
            placeholder="reps"
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={`Repeticiones serie ${label}`}
          />
        )}
        {checkbox}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, set.completed && { backgroundColor: theme.surfaceAlt }]}>
      <View style={styles.row}>
        <Pressable
          onPress={() => setExpanded((e) => !e)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Serie ${label}: ${SET_TYPE_LABELS[type]}. Cambiar tipo y RPE`}
          style={[styles.badge, { borderColor: type === 'normal' ? theme.border : typeColor }]}
        >
          <Text style={[styles.badgeText, { color: typeColor }]}>
            {SET_TYPE_SHORT[type] || label}
          </Text>
        </Pressable>

        <Text style={[styles.previous, { color: theme.textMuted }]} numberOfLines={1}>
          {previous ? `${kgToUnit(previous.weightKg, unit)}×${previous.reps}` : '—'}
        </Text>

        <TextInput
          style={inputStyle}
          value={reps}
          onChangeText={changeReps}
          onFocus={() => (editing.current = 'reps')}
          onBlur={() => (editing.current = null)}
          keyboardType="number-pad"
          placeholder="reps"
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={`Repeticiones serie ${label}`}
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
          accessibilityLabel={`Peso serie ${label} en ${unit}`}
        />
        <Pressable
          onPress={() => removeSet(exerciseId, set.id)}
          hitSlop={8}
          accessibilityLabel={`Eliminar serie ${label}`}
        >
          <Ionicons name="close" size={18} color={theme.textMuted} />
        </Pressable>
        {checkbox}
      </View>

      {set.rpe && !expanded ? (
        <Text style={[styles.rpeNote, { color: theme.textMuted }]}>RPE {set.rpe}</Text>
      ) : null}

      {expanded ? (
        <View style={[styles.panel, { borderColor: theme.border }]}>
          <View style={styles.chips}>
            {(Object.keys(SET_TYPE_LABELS) as SetType[]).map((t) => (
              <Chip
                key={t}
                label={SET_TYPE_LABELS[t]}
                selected={t === type}
                onPress={() => updateSet(exerciseId, set.id, { type: t })}
              />
            ))}
          </View>
          <View style={styles.chips}>
            <Text style={[styles.panelLabel, { color: theme.textMuted }]}>RPE</Text>
            <Chip
              label="—"
              selected={!set.rpe}
              onPress={() => updateSet(exerciseId, set.id, { rpe: undefined })}
            />
            {RPE_OPTIONS.map((rpe) => (
              <Chip
                key={rpe}
                label={String(rpe)}
                selected={set.rpe === rpe}
                onPress={() => updateSet(exerciseId, set.id, { rpe })}
              />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
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
      <Text style={{ color: selected ? theme.onPrimary : theme.text, fontSize: 12, fontWeight: '600' }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  militaryLabel: { flex: 1, fontWeight: '700' },
  militaryInput: { flex: 0, width: 84 },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontWeight: '800', fontVariant: ['tabular-nums'] },
  previous: { width: 52, fontSize: 12, textAlign: 'center', fontVariant: ['tabular-nums'] },
  input: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 16,
    textAlign: 'center',
  },
  checkbox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rpeNote: { fontSize: 11, marginLeft: 42, marginTop: -4, marginBottom: 2 },
  panel: { borderTopWidth: 1, marginHorizontal: 6, paddingVertical: 8, gap: 8 },
  panelLabel: { fontSize: 12, fontWeight: '700', marginRight: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
});
