import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button, Card, Screen, SectionTitle } from '../../components/ui';
import { GYM_EXERCISES, MUSCLE_GROUPS, findExercise } from '../../data/data';
import type { DashboardScreenProps } from '../../navigation/types';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useTheme } from '../../theme/useTheme';
import type { MuscleGroup, RoutineExercise } from '../../types';
import { createId } from '../../utils/format';

type NumericField = 'targetSets' | 'targetReps' | 'restSec';

const FIELDS: { key: NumericField; label: string }[] = [
  { key: 'targetSets', label: 'Series' },
  { key: 'targetReps', label: 'Reps' },
  { key: 'restSec', label: 'Desc. (s)' },
];

export function RoutineBuilderScreen({
  navigation,
  route,
}: DashboardScreenProps<'RoutineBuilder'>) {
  const theme = useTheme();
  const routineId = route.params?.routineId;
  const existing = useRoutineStore((s) => s.routines.find((r) => r.id === routineId));
  const saveRoutine = useRoutineStore((s) => s.saveRoutine);

  const [name, setName] = useState(existing?.name ?? '');
  const [exercises, setExercises] = useState<RoutineExercise[]>(existing?.exercises ?? []);
  const [group, setGroup] = useState<MuscleGroup>('Pecho');

  const addExercise = (exerciseId: string) =>
    setExercises((list) => [...list, { exerciseId, targetSets: 3, targetReps: 10, restSec: 90 }]);

  const updateField = (index: number, key: NumericField, text: string) => {
    const value = parseInt(text, 10);
    setExercises((list) =>
      list.map((ex, i) => (i === index ? { ...ex, [key]: Number.isFinite(value) ? value : 0 } : ex)),
    );
  };

  const move = (index: number, delta: number) =>
    setExercises((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  const remove = (index: number) => setExercises((list) => list.filter((_, i) => i !== index));

  const save = () => {
    if (!name.trim()) return Alert.alert('Falta el nombre', 'Ponle un nombre a la rutina.');
    if (exercises.length === 0) return Alert.alert('Sin ejercicios', 'Añade al menos un ejercicio.');
    if (exercises.some((ex) => ex.targetSets < 1)) {
      return Alert.alert('Series no válidas', 'Cada ejercicio necesita al menos 1 serie.');
    }
    saveRoutine({ id: existing?.id ?? createId(), name: name.trim(), exercises });
    navigation.goBack();
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
  ];

  return (
    <Screen>
      <SectionTitle>Nombre</SectionTitle>
      <TextInput
        style={inputStyle}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Full Body A"
        placeholderTextColor={theme.textMuted}
      />

      <SectionTitle>Ejercicios ({exercises.length})</SectionTitle>
      {exercises.map((ex, index) => (
        <Card key={`${ex.exerciseId}-${index}`}>
          <View style={styles.exerciseHeader}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>
              {findExercise(ex.exerciseId)?.name ?? ex.exerciseId}
            </Text>
            <Pressable onPress={() => move(index, -1)} hitSlop={6} accessibilityLabel="Subir">
              <Ionicons name="chevron-up" size={20} color={theme.textMuted} />
            </Pressable>
            <Pressable onPress={() => move(index, 1)} hitSlop={6} accessibilityLabel="Bajar">
              <Ionicons name="chevron-down" size={20} color={theme.textMuted} />
            </Pressable>
            <Pressable onPress={() => remove(index)} hitSlop={6} accessibilityLabel="Quitar">
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </Pressable>
          </View>
          <View style={styles.fields}>
            {FIELDS.map((field) => (
              <View key={field.key} style={styles.field}>
                <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>{field.label}</Text>
                <TextInput
                  style={inputStyle}
                  value={ex[field.key] ? String(ex[field.key]) : ''}
                  onChangeText={(text) => updateField(index, field.key, text)}
                  keyboardType="number-pad"
                  textAlign="center"
                />
              </View>
            ))}
          </View>
        </Card>
      ))}

      <SectionTitle>Añadir ejercicio</SectionTitle>
      <View style={styles.chips}>
        {MUSCLE_GROUPS.map((g) => {
          const selected = g === group;
          return (
            <Pressable
              key={g}
              onPress={() => setGroup(g)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '600' }}>
                {g}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {GYM_EXERCISES.filter((e) => e.muscleGroup === group).map((exercise) => (
        <Pressable
          key={exercise.id}
          onPress={() => addExercise(exercise.id)}
          style={[styles.option, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>{exercise.name}</Text>
          <Ionicons name="add-circle-outline" size={22} color={theme.accent} />
        </Pressable>
      ))}

      <Button title="Guardar rutina" onPress={save} style={styles.save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  exerciseName: { flex: 1, fontSize: 16, fontWeight: '700' },
  fields: { flexDirection: 'row', gap: 8 },
  field: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  optionText: { flex: 1, fontSize: 15 },
  save: { marginTop: 12 },
});
