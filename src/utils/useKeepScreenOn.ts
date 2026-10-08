import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useEffect } from 'react';

/**
 * Mantiene la pantalla encendida mientras el componente está montado.
 * En navegadores sin Wake Lock falla en silencio en lugar de romper.
 */
export function useKeepScreenOn(tag: string) {
  useEffect(() => {
    activateKeepAwakeAsync(tag).catch(() => {});
    return () => {
      deactivateKeepAwake(tag).catch(() => {});
    };
  }, [tag]);
}
