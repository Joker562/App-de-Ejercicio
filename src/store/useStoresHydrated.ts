import { useEffect, useState } from 'react';

import { useAppStore } from './useAppStore';
import { useBodyStore } from './useBodyStore';
import { useHistoryStore } from './useHistoryStore';
import { useRoutineStore } from './useRoutineStore';
import { useWorkoutStore } from './useWorkoutStore';

const STORES = [useAppStore, useBodyStore, useHistoryStore, useRoutineStore, useWorkoutStore];

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
    update(); // por si terminaron entre el render y el efecto
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [hydrated]);

  return hydrated;
}
