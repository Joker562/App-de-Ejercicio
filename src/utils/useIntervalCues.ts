import { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';

import type { TimerConfig } from '../types';
import type { ClockState } from './clock';
import type { IntervalPhase } from './intervals';
import { speak, useSpokenCountdown } from './voice';

/** Lo que se dice en voz alta al empezar cada fase. */
function spokenPhase(config: TimerConfig, phase: IntervalPhase): string {
  if (phase.done) return '¡Tiempo!';
  if (config.type === 'tabata') return phase.isRest ? 'Descanso' : '¡Trabajo!';
  if (config.type === 'emom') return phase.label;
  return '';
}

/**
 * Avisos de un temporizador de intervalos: vibración y voz en cada cambio de
 * fase, "¡Vamos!" al arrancar, cuenta atrás "3, 2, 1" y pausa al terminar.
 * Con `config` sin definir no hace nada (para poder llamarlo siempre).
 */
export function useIntervalCues(
  config: TimerConfig | undefined,
  phase: IntervalPhase | null,
  clock: ClockState,
  onDone: () => void,
) {
  const enabled = !!config && !!phase;
  const phaseKey = phase?.key ?? 'none';
  const done = phase?.done ?? false;

  const lastPhaseKey = useRef(phaseKey);
  useEffect(() => {
    if (!enabled || phaseKey === lastPhaseKey.current) return;
    lastPhaseKey.current = phaseKey;
    if (!clock.running) return;
    Vibration.vibrate(done ? [0, 400, 200, 400] : 300);
    speak(spokenPhase(config!, phase!));
    if (done) onDone();
  }, [enabled, phaseKey, done, clock.running, config, phase, onDone]);

  // Si el bloque terminó sin que nadie lo viera (app en segundo plano), el
  // reloj seguiría "en marcha": se pausa sin avisar.
  useEffect(() => {
    if (enabled && done && clock.running) onDone();
  }, [enabled, done, clock.running, onDone]);

  // "¡Vamos!" al arrancar desde cero.
  const wasRunning = useRef(clock.running);
  useEffect(() => {
    if (enabled && clock.running && !wasRunning.current && clock.accumulatedMs === 0) {
      speak('¡Vamos!');
    }
    wasRunning.current = clock.running;
  }, [enabled, clock.running, clock.accumulatedMs]);

  useSpokenCountdown(phase?.remainingSec ?? 0, enabled && clock.running && !done, phaseKey);
}
