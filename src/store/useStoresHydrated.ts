import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';
import { useBodyStore } from './useBodyStore';
import { useHistoryStore } from './useHistoryStore';
import { useRoutineStore } from './useRoutineStore';
import { useWorkoutStore } from './useWorkoutStore';

const STORES = [useAppStore, useBodyStore, useHistoryStore, useRoutineStore, useWorkoutStore];

/**
 * Si la carga falla (datos corruptos, migración que lanza...), zustand no
 * marca el store como cargado y no avisa: sin este límite la app se quedaría
 * en la pantalla de inicio para siempre. Pasado este tiempo se muestra con
 * lo que haya (los stores que fallen usan sus valores por defecto).
 */
const HYDRATION_TIMEOUT_MS = 4000;

const allHydrated = () => STORES.every((store) => store.persist.hasHydrated());

/**
 * true cuando todos los stores han cargado lo guardado en el dispositivo.
 * AsyncStorage es asíncrono: sin esperar, el primer render usa los valores
 * por defecto (p. ej. modo militar) y luego "salta" a los guardados.
 */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) return;
    const update = () => {
      if (allHydrated()) setHydrated(true);
    };
    const unsubscribers = STORES.map((store) => store.persist.onFinishHydration(update));
    const timeout = setTimeout(() => {
      if (!allHydrated()) {
        console.warn('No se pudieron cargar todos los datos guardados; se usan valores por defecto.');
      }
      setHydrated(true);
    }, HYDRATION_TIMEOUT_MS);
    update(); // por si terminaron entre el render y el efecto
    return () => {
      clearTimeout(timeout);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [hydrated]);

  return hydrated;
}
