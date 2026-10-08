import { LevelCard } from '../components/LevelCard';
import { ModeSelector } from '../components/ModeSelector';
import { WeeklySummary } from '../components/WeeklySummary';
import { Button, Card, ListItem, Screen, SectionTitle } from '../components/ui';
import type { DashboardScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { useWorkoutStore } from '../store/useWorkoutStore';

export function DashboardScreen({ navigation }: DashboardScreenProps<'Dashboard'>) {
  const mode = useAppStore((s) => s.mode);
  const active = useWorkoutStore((s) => s.active);

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
            title="Temporizadores"
            subtitle="AMRAP, EMOM y Tabata libres"
            onPress={() => navigation.navigate('Timer')}
          />
        </>
      ) : (
        <>
          <SectionTitle>Gimnasio</SectionTitle>
          <ListItem
            title="Mis rutinas"
            subtitle="Empieza una rutina o crea la tuya"
            onPress={() => navigation.navigate('RoutineList')}
          />
          <ListItem
            title="Biblioteca de ejercicios"
            subtitle="Por grupo muscular"
            onPress={() => navigation.navigate('ExerciseLibrary')}
          />
        </>
      )}
    </Screen>
  );
}
