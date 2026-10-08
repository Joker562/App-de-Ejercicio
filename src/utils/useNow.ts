import { useEffect, useState } from 'react';

/**
 * Devuelve Date.now() refrescado cada `intervalMs` mientras `running`.
 * Los temporizadores calculan a partir de marcas de tiempo, así que no
 * acumulan deriva aunque el intervalo se retrase.
 */
export function useNow(running = true, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) return;
    const tick = () => setNow(Date.now());
    // Primer tick inmediato (en un callback, no en el cuerpo del efecto) para
    // no mostrar una hora antigua al arrancar.
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, intervalMs);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [running, intervalMs]);
  return now;
}
