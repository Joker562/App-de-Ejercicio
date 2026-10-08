import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Screen } from '../../components/ui';
import { findExercise } from '../../data/exercises';
import { ROUTINE_PROGRAMS, type RoutineProgram } from '../../data/routineTemplates';
import type { DashboardScreenProps } from '../../navigation/types';
import { useRoutineStore } from '../../store/useRoutineStore';
import { useWorkoutStore } from '../../store/useWorkoutStore';
import { useTheme } from '../../theme/useTheme';
import type { GymRoutine } from '../../types';
import { confirmAction, notify } from '../../utils/dialogs';

const PREVIEW_COUNT = 4;

/**
 * Programas de gimnasio listos para usar: se pueden empezar al momento o
 * guardar en "Mis rutinas", de una en una o el programa completo.
 */
export function RoutineTemplatesScreen({ navigation }: DashboardScreenProps<'RoutineTemplates'>) {
  const theme = useTheme();
  const routines = useRoutineStore((s) => s.routines);
  const addFromTemplates = useRoutineStore((s) => s.addFromTemplates);
  const active = useWorkoutStore((s) => s.active);
  const startGym = useWorkoutStore((s) => s.startGym);

  const saved = new Set(routines.map((r) => r.templateId));

  const save = (templates: GymRoutine[], label: string) => {
    const added = addFromTemplates(templates);
    notify(
      'Guardado en Mis rutinas',
      added === 1 ? `Se añadió "${label}".` : `Se añadieron ${added} rutinas de "${label}".`,
    );
  };

  const start = (routine: GymRoutine) => {
    const go = () => {
      startGym(routine);
      navigation.navigate('ActiveWorkout');
    };
    if (!active) return go();
    confirmAction({
      title: 'Entrenamiento en curso',
      message: `Se descartará "${active.title}". ¿Empezar "${routine.name}"?`,
      confirmText: 'Empezar',
      destructive: true,
      onConfirm: go,
    });
  };

  const renderProgram = (program: RoutineProgram) => {
    const pending = program.routines.filter((r) => !saved.has(r.id));
    return (
      <Card key={program.id}>
        <Text style={[styles.programName, { color: theme.text }]}>{program.name}</Text>
        <Text style={[styles.meta, { color: theme.accent }]}>
          {program.level} · {program.daysPerWeek} · {program.routines.length}{' '}
          {program.routines.length === 1 ? 'rutina' : 'rutinas'}
        </Text>
        <Text style={[styles.description, { color: theme.textMuted }]}>{program.description}</Text>

        {program.routines.map((routine) => {
          const names = routine.exercises.map((re) => findExercise(re.exerciseId)?.name ?? re.exerciseId);
          const extra = names.length - PREVIEW_COUNT;
          const isSaved = saved.has(routine.id);
          return (
            <View
              key={routine.id}
              style={[styles.routine, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}
            >
              <Text style={[styles.routineName, { color: theme.text }]}>{routine.name}</Text>
              <Text style={[styles.exercises, { color: theme.textMuted }]}>
                {names.slice(0, PREVIEW_COUNT).join(' · ')}
                {extra > 0 ? ` · +${extra} más` : ''}
              </Text>
              <View style={styles.actions}>
                <Button title="Empezar ahora" onPress={() => start(routine)} style={styles.flex} />
                <Button
                  title={isSaved ? 'Guardada' : 'Guardar'}
                  variant="secondary"
                  disabled={isSaved}
                  onPress={() => save([routine], routine.name)}
                  style={styles.flex}
                />
              </View>
            </View>
          );
        })}

        {program.routines.length > 1 ? (
          <Button
            title={
              pending.length === 0
                ? 'Programa completo guardado'
                : `Guardar programa completo (${pending.length})`
            }
            variant="secondary"
            disabled={pending.length === 0}
            onPress={() => save(program.routines, program.name)}
          />
        ) : null}
      </Card>
    );
  };

  return (
    <Screen>
      <Text style={[styles.intro, { color: theme.textMuted }]}>
        Elige un programa y empieza al momento, o guárdalo en Mis rutinas para editarlo a tu gusto.
      </Text>
      {ROUTINE_PROGRAMS.map(renderProgram)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20 },
  programName: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 13, fontWeight: '700' },
  description: { fontSize: 14, lineHeight: 20 },
  routine: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  routineName: { fontSize: 16, fontWeight: '700' },
  exercises: { fontSize: 13, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  flex: { flex: 1 },
});
