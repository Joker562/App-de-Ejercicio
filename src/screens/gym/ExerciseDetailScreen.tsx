import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ExerciseAnimation } from '../../components/ExerciseAnimation';
import { ExerciseHistoryCard } from '../../components/ExerciseHistoryCard';
import { Button, Card, Screen, SectionTitle } from '../../components/ui';
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  FORCE_LABELS,
  LEVEL_LABELS,
  MECHANIC_LABELS,
  MUSCLE_LABELS,
  findExercise,
} from '../../data/exercises';
import type { DashboardScreenProps } from '../../navigation/types';
import { usePickExercise } from '../../navigation/usePickExercise';
import { useAppStore } from '../../store/useAppStore';
import { useHistoryStore } from '../../store/useHistoryStore';
import { useTheme } from '../../theme/useTheme';
import { exerciseHistory } from '../../utils/records';

export function ExerciseDetailScreen({ navigation, route }: DashboardScreenProps<'ExerciseDetail'>) {
  const theme = useTheme();
  const exercise = findExercise(route.params.exerciseId);
  const pickFor = route.params.pickFor;
  const pick = usePickExercise(pickFor);
  const sessions = useHistoryStore((s) => s.sessions);
  const unit = useAppStore((s) => s.unit);
  const favorites = useAppStore((s) => s.favoriteExercises);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const history = exerciseHistory(sessions, route.params.exerciseId);
  const isFavorite = favorites.includes(route.params.exerciseId);

  if (!exercise) {
    return (
      <Screen>
        <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Ejercicio no encontrado.</Text>
      </Screen>
    );
  }

  // Algunos pasos de la base vienen vacíos; se omiten para no numerar huecos.
  const steps = exercise.instructions.filter((step) => step.trim() !== '');

  const tags = [
    LEVEL_LABELS[exercise.level],
    CATEGORY_LABELS[exercise.category],
    EQUIPMENT_LABELS[exercise.equipment],
    exercise.mechanic ? MECHANIC_LABELS[exercise.mechanic] : null,
    exercise.force ? FORCE_LABELS[exercise.force] : null,
  ].filter((t): t is string => t !== null);

  return (
    <Screen>
      <ExerciseAnimation exercise={exercise} />
      {exercise.images.length > 1 ? (
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Alterna entre la posición inicial y la final. Toca la imagen para pausar.
        </Text>
      ) : null}

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: theme.text }]}>{exercise.name}</Text>
          <Text style={[styles.nameEn, { color: theme.textMuted }]}>{exercise.nameEn}</Text>
        </View>
        <Pressable
          onPress={() => toggleFavorite(exercise.id)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
        >
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={28}
            color={isFavorite ? theme.accent : theme.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.tags}>
        {tags.map((tag) => (
          <View key={tag} style={[styles.tag, { backgroundColor: theme.surfaceAlt }]}>
            <Text style={[styles.tagText, { color: theme.accent }]}>{tag}</Text>
          </View>
        ))}
      </View>

      <Card>
        <View style={styles.muscleRow}>
          <Text style={[styles.muscleLabel, { color: theme.textMuted }]}>Principales</Text>
          <Text style={[styles.muscleValue, { color: theme.text }]}>
            {exercise.primaryMuscles.map((m) => MUSCLE_LABELS[m]).join(', ')}
          </Text>
        </View>
        {exercise.secondaryMuscles.length > 0 ? (
          <View style={styles.muscleRow}>
            <Text style={[styles.muscleLabel, { color: theme.textMuted }]}>Secundarios</Text>
            <Text style={[styles.muscleValue, { color: theme.text }]}>
              {exercise.secondaryMuscles.map((m) => MUSCLE_LABELS[m]).join(', ')}
            </Text>
          </View>
        ) : null}
      </Card>

      {pick ? (
        <Button
          title={pickFor === 'workout' ? 'Añadir a la sesión' : 'Añadir a la rutina'}
          onPress={() => pick(exercise.id)}
        />
      ) : null}

      {history.length > 0 ? (
        <>
          <SectionTitle>Tu historial</SectionTitle>
          <ExerciseHistoryCard
            history={history}
            unit={unit}
            onOpenProgress={
              pick
                ? undefined
                : () =>
                    navigation.navigate('Historial', {
                      screen: 'ExerciseProgress',
                      params: { exerciseId: exercise.id },
                      initial: false,
                    })
            }
          />
        </>
      ) : null}

      {steps.length > 0 ? (
        <>
          <SectionTitle>Instrucciones</SectionTitle>
          <Card>
            {steps.map((step, i) => (
              <View key={i} style={styles.step}>
                <Text style={[styles.stepNumber, { color: theme.accent }]}>{i + 1}</Text>
                <Text style={[styles.stepText, { color: theme.text }]}>{step}</Text>
              </View>
            ))}
          </Card>
        </>
      ) : null}

      <Text style={[styles.credit, { color: theme.textMuted }]}>
        Imágenes e instrucciones: free-exercise-db (dominio público), traducidas al español.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 12, textAlign: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  name: { fontSize: 24, fontWeight: '800' },
  nameEn: { fontSize: 14, marginTop: 2 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, fontWeight: '700' },
  muscleRow: { flexDirection: 'row', gap: 12 },
  muscleLabel: { width: 96, fontSize: 13 },
  muscleValue: { flex: 1, fontSize: 14, fontWeight: '600' },
  step: { flexDirection: 'row', gap: 10 },
  stepNumber: { fontWeight: '800', minWidth: 16 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },
  credit: { fontSize: 11, textAlign: 'center' },
});
