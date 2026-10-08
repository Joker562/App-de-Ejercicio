import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { Button, Card, Screen, SectionTitle } from '../../components/ui';
import { findExercise } from '../../data/exercises';
import type { DashboardScreenProps } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useTheme } from '../../theme/useTheme';
import type { RoutineExercise } from '../../types';
import { notify } from '../../utils/dialogs';
import { createId } from '../../utils/format';
import { isLinkedWithNext, normalizeSupersets, toggleLinkWithNext } from '../../utils/supersets';

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
  const defaultRestSec = useAppStore((s) => s.defaultRestSec);
  // Militar: sin descanso automático ni superseries; sólo series y reps.
  const mode = existing?.mode ?? route.params?.mode ?? 'gym';
  const isMilitary = mode === 'military';
  const fields = isMilitary ? FIELDS.filter((f) => f.key !== 'restSec') : FIELDS;

  const [name, setName] = useState(existing?.name ?? '');
  const [exercises, setExercises] = useState<RoutineExercise[]>(existing?.exercises ?? []);

  // La biblioteca vuelve aquí con el ejercicio elegido en params.picked. El
  // nonce cambia en cada elección (aunque sea el mismo ejercicio), así que se
  // añade una vez por nonce ajustando el estado durante el render.
  const picked = route.params?.picked;
  const [handledNonce, setHandledNonce] = useState<string>();
  if (picked && picked.nonce !== handledNonce) {
    setHandledNonce(picked.nonce);
    setExercises((list) => [
      ...list,
      { exerciseId: picked.exerciseId, targetSets: 3, targetReps: 10, restSec: defaultRestSec },
    ]);
  }
  // Limpia el parámetro para que no se vuelva a aplicar al editar.
  useEffect(() => {
    if (picked) navigation.setParams({ picked: undefined });
  }, [picked, navigation]);

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
      return normalizeSupersets(next);
    });

  const remove = (index: number) =>
    setExercises((list) => normalizeSupersets(list.filter((_, i) => i !== index)));

  const toggleSuperset = (index: number) => setExercises((list) => toggleLinkWithNext(list, index));

  const save = () => {
    if (!name.trim()) return notify('Falta el nombre', 'Ponle un nombre a la rutina.');
    if (exercises.length === 0) return notify('Sin ejercicios', 'Añade al menos un ejercicio.');
    if (exercises.some((ex) => ex.targetSets < 1)) {
      return notify('Series no válidas', 'Cada ejercicio necesita al menos 1 serie.');
    }
    saveRoutine({
      id: existing?.id ?? createId(),
      name: name.trim(),
      exercises,
      ...(isMilitary ? { mode: 'military' as const } : {}),
      ...(existing?.templateId ? { templateId: existing.templateId } : {}),
    });
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
        placeholder={isMilitary ? 'Ej. Calistenia de mañana' : 'Ej. Full Body A'}
        placeholderTextColor={theme.textMuted}
      />

      <SectionTitle>Ejercicios ({exercises.length})</SectionTitle>
      {exercises.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          Añade ejercicios desde el catálogo completo.
        </Text>
      ) : null}
      {exercises.map((ex, index) => {
        const exercise = findExercise(ex.exerciseId);
        return (
          <View key={`${ex.exerciseId}-${index}`} style={styles.block}>
            <Card style={ex.supersetGroup ? { borderLeftWidth: 4, borderLeftColor: theme.accent } : undefined}>
              <View style={styles.exerciseHeader}>
                {exercise ? (
                  <Pressable
                    onPress={() =>
                      navigation.navigate('ExerciseDetail', { exerciseId: exercise.id })
                    }
                    accessibilityLabel={`Ver cómo se hace ${exercise.name}`}
                  >
                    <ExerciseAnimation exercise={exercise} animated={false} style={styles.thumb} />
                  </Pressable>
                ) : null}
                <Text style={[styles.exerciseName, { color: theme.text }]}>
                  {exercise?.name ?? ex.exerciseId}
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
                {fields.map((field) => (
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
            {!isMilitary && index < exercises.length - 1 ? (
              <Pressable
                onPress={() => toggleSuperset(index)}
                accessibilityRole="button"
                style={styles.linkRow}
              >
                <Ionicons
                  name={isLinkedWithNext(exercises, index) ? 'link' : 'unlink-outline'}
                  size={14}
                  color={isLinkedWithNext(exercises, index) ? theme.accent : theme.textMuted}
                />
                <Text
                  style={[
                    styles.linkText,
                    { color: isLinkedWithNext(exercises, index) ? theme.accent : theme.textMuted },
                  ]}
                >
                  {isLinkedWithNext(exercises, index)
                    ? 'Superserie con el siguiente (toca para separar)'
                    : 'Hacer superserie con el siguiente'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}

      <Button
        title="+ Añadir ejercicio"
        variant="secondary"
        onPress={() => navigation.navigate('ExerciseLibrary', { pickFor: isMilitary ? 'military-routine' : 'routine' })}
      />

      <Button title="Guardar rutina" onPress={save} style={styles.save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 16 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  block: { gap: 4 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 12, paddingVertical: 2 },
  linkText: { fontSize: 12, fontWeight: '600' },
  exerciseName: { flex: 1, fontSize: 16, fontWeight: '700' },
  fields: { flexDirection: 'row', gap: 8 },
  field: { flex: 1, gap: 4 },
  fieldLabel: { fontSize: 12 },
  thumb: { width: 60, borderRadius: 6 },
  empty: { textAlign: 'center', paddingVertical: 8 },
  save: { marginTop: 12 },
});
