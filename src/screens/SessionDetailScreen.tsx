import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SET_TYPE_LABELS, setTypeColor } from '../components/SetRow';
import { Button, Card, Screen } from '../components/ui';
import type { HistoryScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { MODE_LABELS } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import { confirmAction } from '../utils/dialogs';
import { formatDate, formatDuration, kgToUnit } from '../utils/format';
import { isWorkingSet } from '../utils/progression';
import { PASS_SCORE, findProgram, sessionPoints } from '../utils/military';
import { completedSetCount, sessionVolumeKg } from '../utils/stats';

/** Detalle de una sesión terminada. Borrar está aquí, tras confirmar. */
export function SessionDetailScreen({ navigation, route }: HistoryScreenProps<'SessionDetail'>) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const session = useHistoryStore((s) => s.sessions.find((x) => x.id === route.params.sessionId));
  const removeSession = useHistoryStore((s) => s.removeSession);

  if (!session) {
    return (
      <Screen>
        <Text style={[styles.empty, { color: theme.textMuted }]}>Esta sesión ya no existe.</Text>
      </Screen>
    );
  }

  const isGym = session.mode === 'gym';
  const totalSets = session.exercises.reduce((n, ex) => n + ex.sets.filter(isWorkingSet).length, 0);
  const stats = [
    { label: 'Duración', value: formatDuration(session.durationSec) },
    { label: 'Series', value: `${completedSetCount(session)}/${totalSets}` },
    isGym
      ? { label: `Volumen (${unit})`, value: String(Math.round(kgToUnit(sessionVolumeKg(session), unit))) }
      : findProgram(session.sourceId)?.timer?.type === 'amrap'
        ? { label: 'Rondas', value: String(session.roundsCompleted) }
        : { label: 'Puntos', value: `+${sessionPoints(session)}` },
  ];

  const confirmDelete = () =>
    confirmAction({
      title: 'Eliminar sesión',
      message: `¿Eliminar "${session.title}" del historial? No se puede deshacer.`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => {
        navigation.goBack();
        removeSession(session.id);
      },
    });

  return (
    <Screen>
      <View>
        <Text style={[styles.mode, { color: theme.accent }]}>{MODE_LABELS[session.mode]}</Text>
        <Text style={[styles.title, { color: theme.text }]}>{session.title}</Text>
        <Text style={[styles.date, { color: theme.textMuted }]}>{formatDate(session.endedAt)}</Text>
      </View>

      {session.fitnessTest ? (
        <Card>
          <Text style={[styles.testTotal, { color: theme.text }]}>
            {session.fitnessTest.scores.total} / 300
          </Text>
          <Text
            style={[
              styles.testVerdict,
              { color: session.fitnessTest.passed ? theme.success : theme.danger },
            ]}
          >
            {session.fitnessTest.passed ? 'APROBADO' : 'NO APROBADO'}
          </Text>
          {[
            { label: 'Flexiones', value: `${session.fitnessTest.pushups}`, score: session.fitnessTest.scores.pushups },
            { label: 'Abdominales', value: `${session.fitnessTest.situps}`, score: session.fitnessTest.scores.situps },
            { label: 'Carrera 3.2 km', value: formatDuration(session.fitnessTest.runSec), score: session.fitnessTest.scores.run },
          ].map((event) => (
            <View key={event.label} style={styles.testRow}>
              <Text style={[styles.testLabel, { color: theme.text }]}>{event.label}</Text>
              <Text style={{ color: theme.textMuted }}>{event.value}</Text>
              <Text
                style={[
                  styles.testScore,
                  { color: event.score >= PASS_SCORE ? theme.success : theme.danger },
                ]}
              >
                {event.score} pts
              </Text>
            </View>
          ))}
          <Text style={[styles.testNote, { color: theme.textMuted }]}>
            {session.fitnessTest.age} años · {session.fitnessTest.sex === 'male' ? 'hombre' : 'mujer'} ·
            estimación basada en la APFT
          </Text>
        </Card>
      ) : null}

      {session.mode === 'military' ? (
        <Text style={[styles.points, { color: theme.accent }]}>
          +{sessionPoints(session)} puntos de rango
        </Text>
      ) : null}

      <Card style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>{stat.label}</Text>
          </View>
        ))}
      </Card>

      {session.exercises.map((exercise) => (
        <Card key={exercise.id}>
          <View style={styles.exerciseHeader}>
            <Text style={[styles.exerciseName, { color: theme.text }]}>{exercise.name}</Text>
            {exercise.exerciseId ? (
              <Pressable
                onPress={() =>
                  navigation.navigate('Inicio', {
                    screen: 'ExerciseDetail',
                    params: { exerciseId: exercise.exerciseId! },
                  })
                }
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Ver cómo se hace ${exercise.name}`}
              >
                <Ionicons name="information-circle-outline" size={22} color={theme.accent} />
              </Pressable>
            ) : null}
          </View>
          <Text style={[styles.target, { color: theme.textMuted }]}>
            Objetivo: {exercise.target}
            {exercise.supersetGroup ? ' · Superserie' : ''}
          </Text>
          {exercise.sets.map((set, i) => {
            const type = set.type ?? 'normal';
            return (
              <View key={set.id} style={styles.setRow}>
                <Ionicons
                  name={set.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={set.completed ? theme.success : theme.textMuted}
                />
                <Text
                  style={[
                    styles.setText,
                    { color: set.completed ? theme.text : theme.textMuted },
                  ]}
                >
                  {type === 'warmup'
                    ? 'Calentamiento'
                    : `Serie ${exercise.sets.slice(0, i + 1).filter(isWorkingSet).length}`}
                  {isGym ? ` · ${set.reps} reps × ${kgToUnit(set.weightKg, unit)} ${unit}` : ''}
                  {!isGym && set.reps > 0 ? ` · ${set.reps} reps` : ''}
                  {!isGym && set.durationSec ? ` · ${formatDuration(set.durationSec)}` : ''}
                  {set.rpe ? ` · RPE ${set.rpe}` : ''}
                  {set.completed ? '' : ' (sin completar)'}
                </Text>
                {type === 'drop' || type === 'failure' ? (
                  <Text style={[styles.typeTag, { color: setTypeColor(type, theme) }]}>
                    {SET_TYPE_LABELS[type]}
                  </Text>
                ) : null}
              </View>
            );
          })}
          {exercise.notes ? (
            <Text style={[styles.notes, { color: theme.textMuted }]}>Nota: {exercise.notes}</Text>
          ) : null}
        </Card>
      ))}

      <Button title="Eliminar sesión" variant="danger" onPress={confirmDelete} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
  mode: { fontSize: 12, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '800' },
  date: { fontSize: 14, marginTop: 2 },
  stats: { flexDirection: 'row' },
  testTotal: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  testVerdict: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  testRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  testLabel: { flex: 1, fontWeight: '600' },
  testScore: { width: 64, textAlign: 'right', fontWeight: '800' },
  testNote: { fontSize: 11, textAlign: 'center' },
  points: { fontSize: 14, fontWeight: '800', textAlign: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  statLabel: { fontSize: 12 },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  exerciseName: { flex: 1, fontSize: 17, fontWeight: '700' },
  target: { fontSize: 13 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  setText: { flex: 1, fontSize: 14, fontVariant: ['tabular-nums'] },
  typeTag: { fontSize: 12, fontWeight: '700' },
  notes: { fontSize: 13, fontStyle: 'italic' },
});
