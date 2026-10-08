import type { TimerConfig } from '../types';

export interface IntervalPhase {
  /** Clave única de la fase actual; cambia en cada transición (sirve para avisar). */
  key: string;
  /** Texto principal: "Trabajo", "Descanso", "Minuto 3 de 12"... */
  label: string;
  /** Segundos restantes en la fase actual (lo que se muestra grande). */
  remainingSec: number;
  /** 0..1 dentro de la fase actual. */
  phaseProgress: number;
  /** Segundos restantes del bloque entero. */
  totalRemainingSec: number;
  isRest: boolean;
  done: boolean;
}

export function timerTotalSec(config: TimerConfig): number {
  switch (config.type) {
    case 'amrap':
      return config.durationSec;
    case 'emom':
      return config.minutes * 60;
    case 'tabata':
      // La última ronda termina sin descanso.
      return config.rounds * (config.workSec + config.restSec) - config.restSec;
  }
}

export function describeTimer(config: TimerConfig): string {
  switch (config.type) {
    case 'amrap':
      return `AMRAP ${Math.round(config.durationSec / 60)} min`;
    case 'emom':
      return `EMOM ${config.minutes} min`;
    case 'tabata':
      return `Tabata ${config.rounds} x ${config.workSec}s/${config.restSec}s`;
  }
}

export function intervalPhase(config: TimerConfig, elapsedMs: number): IntervalPhase {
  const total = timerTotalSec(config);
  const elapsed = Math.min(elapsedMs / 1000, total);
  const totalRemainingSec = total - elapsed;
  const done = elapsed >= total;

  switch (config.type) {
    case 'amrap':
      return {
        key: done ? 'done' : 'amrap',
        label: done ? 'Tiempo' : 'Tiempo restante',
        remainingSec: totalRemainingSec,
        phaseProgress: elapsed / total,
        totalRemainingSec,
        isRest: false,
        done,
      };

    case 'emom': {
      const minute = Math.min(Math.floor(elapsed / 60) + 1, config.minutes);
      const inMinute = done ? 60 : elapsed - (minute - 1) * 60;
      return {
        key: done ? 'done' : `emom-${minute}`,
        label: done ? 'Completado' : `Minuto ${minute} de ${config.minutes}`,
        remainingSec: 60 - inMinute,
        phaseProgress: inMinute / 60,
        totalRemainingSec,
        isRest: false,
        done,
      };
    }

    case 'tabata': {
      const cycle = config.workSec + config.restSec;
      const round = Math.min(Math.floor(elapsed / cycle) + 1, config.rounds);
      const inCycle = elapsed - (round - 1) * cycle;
      const isRest = !done && inCycle >= config.workSec;
      const phaseLength = isRest ? config.restSec : config.workSec;
      const inPhase = isRest ? inCycle - config.workSec : inCycle;
      return {
        key: done ? 'done' : `tabata-${round}-${isRest ? 'rest' : 'work'}`,
        label: done
          ? 'Completado'
          : `${isRest ? 'Descanso' : 'Trabajo'} · Ronda ${round} de ${config.rounds}`,
        remainingSec: done ? 0 : phaseLength - inPhase,
        phaseProgress: done ? 1 : inPhase / phaseLength,
        totalRemainingSec,
        isRest,
        done,
      };
    }
  }
}
