import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { MuscleVolumeCard } from '../components/MuscleVolumeCard';
import { ProgressChart } from '../components/ProgressChart';
import { Card, ListItem, Screen, SectionTitle } from '../components/ui';
import type { HistoryScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { MODE_LABELS } from '../theme/palettes';
import { useTheme } from '../theme/useTheme';
import type { Session } from '../types';
import { formatDate, formatDuration, kgToUnit } from '../utils/format';
import { describeRecord, exerciseHistory, startOfDay, trainedExercises } from '../utils/records';
import { completedSetCount, sessionVolumeKg } from '../utils/stats';

const CHART_SESSIONS = 8;
const EXERCISES_PREVIEW = 6;
const RECENT_RECORDS = 6;

function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

/**
 * Historial del modo activo: calendario de actividad, volumen por sesión y
 * por grupo muscular, récords, progreso por ejercicio y lista de sesiones.
 */
export function HistoryScreen({ navigation }: HistoryScreenProps<'History'>) {
  const theme = useTheme();
  const mode = useAppStore((s) => s.mode);
  const unit = useAppStore((s) => s.unit);
  const allSessions = useHistoryStore((s) => s.sessions);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAllExercises, setShowAllExercises] = useState(false);

  const sessions = allSessions.filter((s) => s.mode === mode);
  const recent = sessions.slice(0, CHART_SESSIONS).reverse();
  const isGym = mode === 'gym';

  const chartData = recent.map((s) => ({
    label: shortDate(s.endedAt),
    value: isGym ? kgToUnit(sessionVolumeKg(s), unit) : completedSetCount(s) || s.roundsCompleted,
  }));

  const records = sessions
    .flatMap((s) => (s.records ?? []).map((record) => ({ record, session: s })))
    .slice(0, RECENT_RECORDS);

  const exercises = trainedExercises(sessions, mode);
  const visibleExercises = showAllExercises ? exercises : exercises.slice(0, EXERCISES_PREVIEW);

  const daySessions = selectedDay
    ? allSessions.filter((s) => startOfDay(s.endedAt) === selectedDay)
    : [];

  const sessionSubtitle = (s: Session) => {
    const parts = [formatDate(s.endedAt), formatDuration(s.durationSec)];
    if (s.mode === 'gym') parts.push(`${Math.round(kgToUnit(sessionVolumeKg(s), unit))} ${unit}`);
    else if (s.fitnessTest) parts.push(`${s.fitnessTest.scores.total}/300`);
    else if (s.roundsCompleted > 0) parts.push(`${s.roundsCompleted} rondas`);
    else parts.push(`${completedSetCount(s)} series`);
    if (s.records?.length) parts.push(`${s.records.length} récord${s.records.length > 1 ? 's' : ''}`);
    return parts.join(' · ');
  };

  const sessionItem = (s: Session) => (
    <ListItem
      key={s.id}
      title={s.title}
      subtitle={sessionSubtitle(s)}
      onPress={() => navigation.navigate('SessionDetail', { sessionId: s.id })}
      right={<Ionicons name="chevron-forward" size={18} color={theme.textMuted} />}
    />
  );

  return (
    <Screen>
      <Text style={[styles.mode, { color: theme.accent }]}>{MODE_LABELS[mode]}</Text>

      <Card>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Actividad</Text>
        <CalendarHeatmap
          sessions={allSessions}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
      </Card>
      {selectedDay ? (
        <>
          <SectionTitle>{formatDate(selectedDay)}</SectionTitle>
          {daySessions.map(sessionItem)}
        </>
      ) : null}

      <Card>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {isGym ? `Volumen por sesión (${unit})` : 'Series o rondas por sesión'}
        </Text>
        <ProgressChart data={chartData} />
      </Card>

      <MuscleVolumeCard sessions={allSessions} mode={mode} />

      {records.length > 0 ? (
        <>
          <SectionTitle>Récords recientes</SectionTitle>
          <Card>
            {records.map(({ record, session }, i) => {
              const { title, detail } = describeRecord(record, unit);
              return (
                <Pressable
                  key={`${session.id}-${i}`}
                  onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
                  style={styles.recordRow}
                  accessibilityRole="button"
                >
                  <Ionicons name="trophy" size={18} color={theme.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.recordTitle, { color: theme.text }]}>{title}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                      {detail} · {formatDate(session.endedAt)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </>
      ) : null}

      {exercises.length > 0 ? (
        <>
          <SectionTitle>Progreso por ejercicio</SectionTitle>
          {visibleExercises.map((ex) => {
            const history = exerciseHistory(sessions, ex.exerciseId);
            const bestE1rm = Math.max(0, ...history.map((p) => p.bestE1rmKg));
            const bestReps = Math.max(0, ...history.map((p) => p.bestReps));
            return (
              <ListItem
                key={ex.exerciseId}
                title={ex.name}
                subtitle={
                  bestE1rm > 0
                    ? `1RM estimado ${kgToUnit(bestE1rm, unit)} ${unit} · ${ex.sessions} sesiones`
                    : `Máx. ${bestReps} reps · ${ex.sessions} sesiones`
                }
                onPress={() => navigation.navigate('ExerciseProgress', { exerciseId: ex.exerciseId })}
                right={<Ionicons name="trending-up" size={18} color={theme.accent} />}
              />
            );
          })}
          {exercises.length > EXERCISES_PREVIEW ? (
            <Pressable onPress={() => setShowAllExercises((v) => !v)} accessibilityRole="button">
              <Text style={[styles.more, { color: theme.accent }]}>
                {showAllExercises ? 'Ver menos' : `Ver los ${exercises.length} ejercicios`}
              </Text>
            </Pressable>
          ) : null}
        </>
      ) : null}

      <SectionTitle>Sesiones ({sessions.length})</SectionTitle>
      {sessions.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>
          Aún no hay sesiones en este modo.
        </Text>
      ) : (
        sessions.map(sessionItem)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  mode: { fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', paddingVertical: 16 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  recordTitle: { fontSize: 14, fontWeight: '700' },
  more: { textAlign: 'center', fontWeight: '700', paddingVertical: 6 },
});
