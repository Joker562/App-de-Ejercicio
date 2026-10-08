import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Almacenamiento local compartido por los stores persistidos (offline-first). */
export const persistStorage = createJSONStorage(() => AsyncStorage);

/**
 * Versión del formato guardado en el dispositivo. Súbela cuando cambie la
 * forma de los datos persistidos y añade el paso correspondiente en el
 * `migrate` de cada store afectado. Sin `migrate`, zustand descarta los datos
 * de una versión distinta, así que todos los stores lo declaran.
 *
 * Historial de versiones:
 * - 0: primeras versiones (sin campo version).
 * - 1: ids de ejercicios de free-exercise-db y rutinas con templateId.
 */
export const STORAGE_VERSION = 1;
