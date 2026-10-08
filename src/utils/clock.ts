import { useMemo, useState } from 'react';

/** Reloj pausable basado en marcas de tiempo (serializable). */
export interface ClockState {
  running: boolean;
  startedAt: number | null;
  accumulatedMs: number;
}

export interface ClockControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export const IDLE_CLOCK: ClockState = { running: false, startedAt: null, accumulatedMs: 0 };

export function clockElapsedMs(clock: ClockState, now: number): number {
  // `now` puede ser de un render anterior al arranque: nunca tiempo negativo.
  const running = clock.running && clock.startedAt ? Math.max(0, now - clock.startedAt) : 0;
  return clock.accumulatedMs + running;
}

export function startClock(clock: ClockState): ClockState {
  return clock.running ? clock : { ...clock, running: true, startedAt: Date.now() };
}

export function pauseClock(clock: ClockState): ClockState {
  if (!clock.running) return clock;
  return {
    running: false,
    startedAt: null,
    accumulatedMs: clockElapsedMs(clock, Date.now()),
  };
}

/** Reloj en estado local, para temporizadores sueltos fuera de un entrenamiento. */
export function useLocalClock(): [ClockState, ClockControls] {
  const [clock, setClock] = useState<ClockState>(IDLE_CLOCK);
  const controls = useMemo<ClockControls>(
    () => ({
      start: () => setClock(startClock),
      pause: () => setClock(pauseClock),
      reset: () => setClock(IDLE_CLOCK),
    }),
    [],
  );
  return [clock, controls];
}
