import { Image } from 'expo-image';

import { MILITARY_PROGRAMS } from '../data/data';
import { exerciseImageUrls, findExercise } from '../data/exercises';
import { useHistoryStore } from '../store/useHistoryStore';
import { useRoutineStore } from '../store/useRoutineStore';

/** Tope para no descargar de golpe medio catálogo con datos móviles. */
const MAX_IMAGES = 160;
const RECENT_SESSIONS = 20;

/**
 * Descarga a la caché de disco las fotos de lo que sueles entrenar (tus
 * rutinas, los programas militares y tus sesiones recientes), para que se
 * vean aunque luego no haya conexión en el gimnasio.
 */
export function prefetchTrainingImages() {
  const ids = new Set<string>();
  for (const routine of useRoutineStore.getState().routines) {
    routine.exercises.forEach((e) => ids.add(e.exerciseId));
  }
  for (const program of MILITARY_PROGRAMS) {
    program.movements.forEach((m) => m.exerciseId && ids.add(m.exerciseId));
  }
  for (const session of useHistoryStore.getState().sessions.slice(0, RECENT_SESSIONS)) {
    session.exercises.forEach((e) => e.exerciseId && ids.add(e.exerciseId));
  }

  const urls = [...ids]
    .flatMap((id) => {
      const exercise = findExercise(id);
      return exercise ? exerciseImageUrls(exercise) : [];
    })
    .slice(0, MAX_IMAGES);
  if (urls.length === 0) return;
  Image.prefetch(urls, 'disk').catch(() => {
    // Sin conexión o algún fallo: se reintentará en la próxima apertura.
  });
}
