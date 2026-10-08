import { useAppStore } from '../store/useAppStore';
import type { Palette } from './palettes';
import { PALETTES } from './palettes';

/** Paleta del modo activo: cambiar de modo re-tematiza toda la app. */
export function useTheme(): Palette {
  const mode = useAppStore((s) => s.mode);
  return PALETTES[mode];
}
