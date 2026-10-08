import { LevelCard } from '../components/LevelCard';
import { ModeSelector } from '../components/ModeSelector';
import { WeeklySummary } from '../components/WeeklySummary';
import { Button, Card, ListItem, Screen, SectionTitle } from '../components/ui';
import { exercisesForMode } from '../data/exercises';
import { ROUTINE_PROGRAMS } from '../data/routineTemplates';
import type { DashboardScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';

export function DashboardScreen({ navigation }: DashboardScreenProps<'Dashboard'>) {
  const mode = useAppStore((s) => s.mode);
  const active = useWorkoutStore((s) => s.active);
  const librarySubtitle =
    mode === 'military'
      ? `${exercisesForMode('military').length} ejercicios de calistenia con animación`
      : `${exercisesForMode('gym').length} ejercicios de gimnasio con animación`;

  return (
    <Screen>
      <ModeSelector />

      {active ? (
        <Card>
          <ListItem
            title={`En curso: ${active.title}`}
            subtitle="Tienes un entrenamiento sin terminar"
          />
          <Button title="Continuar entrenamiento" onPress={() => navigation.navigate('ActiveWorkout')} />
        </Card>
      ) : null}

      <WeeklySummary />

      {mode === 'military' ? (
        <>
          <LevelCard />
          <SectionTitle>Calistenia militar</SectionTitle>
          <ListItem
            title="Programas de entrenamiento"
            subtitle="Murph, prueba física, EMOM, Tabata..."
            onPress={() => navigation.navigate('ProgramList')}
          />
          <ListItem
            title="Prueba física"
            subtitle="Flexiones, abdominales y 3.2 km con nota sobre 300"
            onPress={() => navigation.navigate('FitnessTest')}
          />
          <ListItem
            title="Progresiones"
            subtitle="Escaleras de calistenia paso a paso"
            onPress={() => navigation.navigate('Progressions')}
          />
          <ListItem
            title="Temporizadores"
            subtitle="AMRAP, EMOM y Tabata libres"
            onPress={() => navigation.navigate('Timer')}
          />
          <ListItem
            title="Biblioteca de ejercicios"
            subtitle={librarySubtitle}
            onPress={() => navigation.navigate('ExerciseLibrary')}
          />
        </>
      ) : (
        <>
          <SectionTitle>Gimnasio</SectionTitle>
          <ListItem
            title="Rutinas precreadas"
            subtitle={`${ROUTINE_PROGRAMS.length} programas listos: PPL, Torso/Pierna, 5×5...`}
            onPress={() => navigation.navigate('RoutineTemplates')}
          />
          <ListItem
            title="Mis rutinas"
            subtitle="Empieza una rutina o crea la tuya"
            onPress={() => navigation.navigate('RoutineList')}
          />
          <ListItem
            title="Biblioteca de ejercicios"
            subtitle={librarySubtitle}
            onPress={() => navigation.navigate('ExerciseLibrary')}
          />
          <ListItem
            title="Calculadora de discos"
            subtitle="Qué discos poner y cómo calentar"
            onPress={() => navigation.navigate('PlateCalculator')}
          />
        </>
      )}
    </Screen>
  );
}
