import { useEffect } from 'react';
import { Vibration } from 'react-native';

import { useWorkoutStore } from '../store/useWorkoutStore';
import { clockElapsedMs } from '../utils/clock';
import { intervalPhase } from '../utils/intervals';
import { useIntervalCues } from '../utils/useIntervalCues';
import { useNow } from '../utils/useNow';
import { speak, useSpokenCountdown } from '../utils/voice';

/** Si el descanso acabó hace más de esto (app en segundo plano), no se avisa tarde. */
const LATE_CUE_MS = 3000;

/**
 * Avisos del entrenamiento en curso (fin del descanso y fases del
 * AMRAP/EMOM/Tabata). Vive en la raíz de la app para avisar aunque estés en
 * otra pantalla, p. ej. viendo cómo se hace un ejercicio durante el descanso.
 * Con la app en segundo plano avisan las notificaciones.
 */
export function WorkoutCues() {
  const timer = useWorkoutStore((s) => s.active?.timer);
  const clock = useWorkoutStore((s) => s.clock);
  const rest = useWorkoutStore((s) => s.rest);
  const pauseTimer = useWorkoutStore((s) => s.pauseTimer);
  const skipRest = useWorkoutStore((s) => s.skipRest);
  const now = useNow(clock.running || rest !== null);

  // Descanso
  const restRemaining = rest ? Math.max(0, (rest.endsAt - now) / 1000) : 0;
  const restFinished = rest !== null && restRemaining <= 0;
  useSpokenCountdown(restRemaining, rest !== null, `rest-${rest?.endsAt}`);
  useEffect(() => {
    if (!restFinished || !rest) return;
    if (Date.now() - rest.endsAt < LATE_CUE_MS) {
      Vibration.vibrate([0, 300, 150, 300]);
      speak('¡A por la siguiente serie!');
    }
    skipRest();
  }, [restFinished, rest, skipRest]);

  // Intervalos del entrenamiento
  const phase = timer ? intervalPhase(timer, clockElapsedMs(clock, now)) : null;
  useIntervalCues(timer, phase, clock, pauseTimer);

  return null;
}
