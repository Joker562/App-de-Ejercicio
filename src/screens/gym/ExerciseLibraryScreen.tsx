import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { FilterChips } from '../../components/FilterChips';
import { MUSCLE_GROUPS } from '../../data/data';
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_LABELS,
  filterExercises,
} from '../../data/exercises';
import type { DashboardScreenProps } from '../../navigation/types';
import { useTheme } from '../../theme/useTheme';
import type { Equipment, Exercise, ExerciseCategory, MuscleGroup } from '../../types';
import { createId } from '../../utils/format';

const MUSCLE_OPTIONS = MUSCLE_GROUPS.map((g) => ({ value: g, label: g }));
const EQUIPMENT_OPTIONS = (Object.keys(EQUIPMENT_LABELS) as Equipment[]).map((value) => ({
  value,
  label: EQUIPMENT_LABELS[value],
}));
const CATEGORY_OPTIONS = (Object.keys(CATEGORY_LABELS) as ExerciseCategory[]).map((value) => ({
  value,
  label: CATEGORY_LABELS[value],
}));

/**
 * Catálogo completo con búsqueda y filtros. Con pickForRoutine, cada fila
 * tiene un botón para añadir el ejercicio a la rutina que se está creando.
 */
export function ExerciseLibraryScreen({
  navigation,
  route,
}: DashboardScreenProps<'ExerciseLibrary'>) {
  const theme = useTheme();
  const pickForRoutine = route.params?.pickForRoutine ?? false;

  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [category, setCategory] = useState<ExerciseCategory | null>(null);

  const results = useMemo(
    () => filterExercises({ query, muscleGroup, equipment, category }),
    [query, muscleGroup, equipment, category],
  );

  const pick = (exercise: Exercise) =>
    navigation.popTo(
      'RoutineBuilder',
      { picked: { exerciseId: exercise.id, nonce: createId() } },
      { merge: true },
    );

  const renderItem = ({ item }: { item: Exercise }) => (
    <Pressable
      onPress={() =>
        navigation.navigate('ExerciseDetail', { exerciseId: item.id, pickForRoutine })
      }
      style={({ pressed }) => [
        styles.item,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <ExerciseAnimation exercise={item} animated={false} style={styles.thumb} />
      <View style={styles.itemText}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={[styles.meta, { color: theme.textMuted }]} numberOfLines={1}>
          {item.primaryMuscles.map((m) => MUSCLE_LABELS[m]).join(', ')} ·{' '}
          {EQUIPMENT_LABELS[item.equipment]}
        </Text>
      </View>
      {pickForRoutine ? (
        <Pressable
          onPress={() => pick(item)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Añadir ${item.name} a la rutina`}
        >
          <Ionicons name="add-circle" size={30} color={theme.accent} />
        </Pressable>
      ) : (
        <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
      )}
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={styles.filters}>
        <View
          style={[styles.search, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar (español o inglés)"
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
            autoCorrect={false}
            returnKeyType="search"
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Borrar búsqueda">
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </Pressable>
          ) : null}
        </View>
        <FilterChips options={MUSCLE_OPTIONS} selected={muscleGroup} onChange={setMuscleGroup} />
        <FilterChips
          options={EQUIPMENT_OPTIONS}
          selected={equipment}
          onChange={setEquipment}
          allLabel="Todo el equipo"
        />
        <FilterChips
          options={CATEGORY_OPTIONS}
          selected={category}
          onChange={setCategory}
          allLabel="Todos los tipos"
        />
        <Text style={[styles.count, { color: theme.textMuted }]}>
          {results.length} {results.length === 1 ? 'ejercicio' : 'ejercicios'}
          {pickForRoutine ? ' · toca + para añadir' : ''}
        </Text>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
        windowSize={7}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.textMuted }]}>
            No hay ejercicios con esos filtros.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filters: { paddingTop: 12, gap: 8 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  count: { fontSize: 12, paddingHorizontal: 16 },
  list: { padding: 16, paddingTop: 8, gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
  },
  thumb: { width: 84, borderRadius: 8 },
  itemText: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12 },
  empty: { textAlign: 'center', paddingVertical: 32 },
});
