import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Almacenamiento local compartido por los stores persistidos (offline-first). */
export const persistStorage = createJSONStorage(() => AsyncStorage);
