import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { findExercise } from '../data/exercises';
import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';
import { useTheme } from '../theme/useTheme';
import type { TrainingMode, WorkoutExercise } from '../types';
import { confirmAction, notify } from '../utils/dialogs';
import { kgToUnit, unitToKg } from '../utils/format';
import { BAR_OPTIONS, isWorkingSet, suggestProgression, warmupFor } from '../utils/progression';
import { SetRow } from './SetRow';
import { Button, Card } from './ui';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface Props {
  exercise: WorkoutExercise;
  mode: TrainingMode;
  isFirst: boolean;
  isLast: boolean;
  /** Enlazado en superserie con el siguiente ejercicio. */
  linkedWithNext: boolean;
  onOpenDetail: (catalogId: string) => void;
  onOpenPlates: (weightKg: number) => void;
}

/** Equipo con barra: tiene sentido calcular discos y calentamiento. */
const BARBELL_EQUIPMENT = new Set(['barbell', 'e-z curl bar']);

export function WorkoutExerciseCard({
  exercise,
  mode,
  isFirst,
  isLast,
  linkedWithNext,
  onOpenDetail,
  onOpenPlates,
}: Props) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const addSet = useWorkoutStore((s) => s.addSet);
  const applyWeight = useWorkoutStore((s) => s.applyWeight);
  const setWarmups = useWorkoutStore((s) => s.setWarmups);
  const removeExercise = useWorkoutStore((s) => s.removeExercise);
  const moveExercise = useWorkoutStore((s) => s.moveExercise);
  const toggleSuperset = useWorkoutStore((s) => s.toggleSupersetWithNext);
  const setNotes = useWorkoutStore((s) => s.setNotes);
  const [notesOpen, setNotesOpen] = useState(!!exercise.notes);

  const isGym = mode === 'gym';
  const meta = exercise.exerciseId ? findExercise(exercise.exerciseId) : undefined;
  const usesBar = !!meta && BARBELL_EQUIPMENT.has(meta.equipment);
  const workingSets = exercise.sets.filter(isWorkingSet);
  const firstWorkingKg = workingSets.find((s) => s.weightKg > 0)?.weightKg ?? 0;

  const advice = isGym
    ? suggestProgression({
        previous: exercise.previous,
        targetSets: workingSets.length,
        targetReps: exercise.targetReps,
        exercise: meta,
        unit,
      })
    : null;
  // Se oculta cuando ya se aplicó (todas las pendientes tienen ese peso).
  const pendingWorking = workingSets.filter((s) => !s.completed);
  const adviceApplied =
    !!advice && pendingWorking.every((s) => Math.abs(s.weightKg - advice.weightKg) < 0.01);

  const addWarmups = () => {
    if (firstWorkingKg <= 0) {
      notify('Falta el peso', 'Pon primero el peso de trabajo de las series.');
      return;
    }
    const bar = BAR_OPTIONS[unit][0];
    const steps = warmupFor(kgToUnit(firstWorkingKg, unit), usesBar ? bar : 0, unit);
    if (steps.length === 0) {
      notify('Sin calentamiento', 'El peso de trabajo es demasiado bajo para calentar por escalones.');
      return;
    }
    setWarmups(
      exercise.id,
      steps.map((step) => ({ reps: step.reps, weightKg: unitToKg(step.weight, unit) })),
    );
  };

  const confirmRemove = () =>
    confirmAction({
      title: 'Quitar ejercicio',
      message: `¿Quitar "${exercise.name}" de esta sesión?`,
      confirmText: 'Quitar',
      destructive: true,
      onConfirm: () => removeExercise(exercise.id),
    });

  const tools: { icon: IconName; label: string; onPress: () => void; active?: boolean; show: boolean }[] = [
    { icon: 'chevron-up', label: 'Subir', onPress: () => moveExercise(exercise.id, -1), show: !isFirst },
    { icon: 'chevron-down', label: 'Bajar', onPress: () => moveExercise(exercise.id, 1), show: !isLast },
    {
      icon: 'link',
      label: linkedWithNext ? 'Quitar superserie con el siguiente' : 'Superserie con el siguiente',
      onPress: () => toggleSuperset(exercise.id),
      active: linkedWithNext,
      show: isGym && !isLast,
    },
    {
      icon: 'create-outline',
      label: 'Notas',
      onPress: () => setNotesOpen((o) => !o),
      active: notesOpen,
      show: true,
    },
    { icon: 'flame-outline', label: 'Añadir calentamiento', onPress: addWarmups, show: isGym },
    {
      icon: 'calculator-outline',
      label: 'Calcular discos',
      onPress: () => onOpenPlates(firstWorkingKg),
      show: isGym && usesBar,
    },
    { icon: 'trash-outline', label: 'Quitar ejercicio', onPress: confirmRemove, show: true },
  ];

  let workingIndex = 0;
  let warmupIndex = 0;

  return (
    <Card
      style={
        exercise.supersetGroup
          ? { borderLeftWidth: 4, borderLeftColor: theme.accent }
          : undefined
      }
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: theme.text }]}>{exercise.name}</Text>
        <Text style={[styles.target, { color: theme.accent }]}>{exercise.target}</Text>
        {exercise.exerciseId ? (
          <Pressable
            onPress={() => onOpenDetail(exercise.exerciseId!)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Ver cómo se hace ${exercise.name}`}
          >
            <Ionicons name="information-circle-outline" size={22} color={theme.accent} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.tools}>
        {tools
          .filter((t) => t.show)
          .map((tool) => (
            <Pressable
              key={tool.label}
              onPress={tool.onPress}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={tool.label}
              style={[
                styles.tool,
                { backgroundColor: tool.active ? theme.primary : theme.surfaceAlt },
              ]}
            >
              <Ionicons
                name={tool.icon}
                size={17}
                color={tool.active ? theme.onPrimary : tool.icon === 'trash-outline' ? theme.danger : theme.textMuted}
              />
            </Pressable>
          ))}
      </View>

      {advice && !adviceApplied ? (
        <View style={[styles.advice, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
          <Ionicons
            name={advice.kind === 'increase' ? 'trending-up' : 'repeat'}
            size={18}
            color={advice.kind === 'increase' ? theme.success : theme.accent}
          />
          <Text style={[styles.adviceText, { color: theme.text }]}>
            {advice.kind === 'increase'
              ? `Sube a ${kgToUnit(advice.weightKg, unit)} ${unit}: la última vez completaste todo con ${kgToUnit(advice.fromKg, unit)} ${unit}.`
              : `Repite ${kgToUnit(advice.weightKg, unit)} ${unit} hasta completar ${exercise.target}.`}
          </Text>
          <Pressable
            onPress={() => applyWeight(exercise.id, advice.weightKg)}
            accessibilityRole="button"
            style={[styles.adviceButton, { backgroundColor: theme.primary }]}
          >
            <Text style={{ color: theme.onPrimary, fontWeight: '700', fontSize: 12 }}>Aplicar</Text>
          </Pressable>
        </View>
      ) : null}

      {isGym && exercise.sets.length > 0 ? (
        <View style={styles.columns}>
          <Text style={[styles.colIndex, { color: theme.textMuted }]}>#</Text>
          <Text style={[styles.colPrevious, { color: theme.textMuted }]}>Anterior</Text>
          <Text style={[styles.col, { color: theme.textMuted }]}>Reps</Text>
          <Text style={[styles.col, { color: theme.textMuted }]}>{unit}</Text>
          <View style={styles.colTrailing} />
        </View>
      ) : null}

      {exercise.sets.map((set) => {
        const working = isWorkingSet(set);
        const label = working ? String(++workingIndex) : `C${++warmupIndex}`;
        return (
          <SetRow
            key={set.id}
            exerciseId={exercise.id}
            set={set}
            label={label}
            mode={mode}
            measure={exercise.measure}
            previous={working ? exercise.previous?.[workingIndex - 1] : undefined}
          />
        );
      })}

      {notesOpen ? (
        <TextInput
          value={exercise.notes ?? ''}
          onChangeText={(text) => setNotes(exercise.id, text)}
          placeholder="Notas: técnica, sensaciones, ajustes de la máquina..."
          placeholderTextColor={theme.textMuted}
          multiline
          style={[
            styles.notes,
            { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
          ]}
        />
      ) : null}

      {isGym ? (
        <Button title="+ Añadir serie" variant="secondary" onPress={() => addSet(exercise.id)} />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 18, fontWeight: '700', flex: 1 },
  target: { fontSize: 13, fontWeight: '700' },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tool: { width: 32, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  advice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 8,
  },
  adviceText: { flex: 1, fontSize: 13, lineHeight: 18 },
  adviceButton: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  // Alineado con las columnas de SetRow.
  columns: { flexDirection: 'row', gap: 8, paddingHorizontal: 6 },
  colIndex: { width: 28, fontSize: 12, textAlign: 'center' },
  colPrevious: { width: 52, fontSize: 12, textAlign: 'center' },
  col: { flex: 1, fontSize: 12, textAlign: 'center' },
  // Icono de borrar (18) + checkbox (34) + huecos (2 x 8).
  colTrailing: { width: 68 },
  notes: { borderWidth: 1, borderRadius: 10, padding: 10, minHeight: 60, fontSize: 14, textAlignVertical: 'top' },
});
