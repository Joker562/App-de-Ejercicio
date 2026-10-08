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
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [running, intervalMs]);
  return now;
}
