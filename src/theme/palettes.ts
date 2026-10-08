import type { TrainingMode } from '../types';

export interface Palette {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  primary: string;
  onPrimary: string;
  accent: string;
  text: string;
  textMuted: string;
  success: string;
  danger: string;
}

/** Militar: verde oliva sobre negro. */
const military: Palette = {
  background: '#0E0F0B',
  surface: '#1A1C15',
  surfaceAlt: '#25281D',
  border: '#34382A',
  primary: '#6B7A3A',
  onPrimary: '#F2F0E6',
  accent: '#C2B280',
  text: '#ECEAE0',
  textMuted: '#9A9A88',
  success: '#8DA34A',
  danger: '#C2553D',
};

/** Gimnasio: azul sobre gris oscuro. */
const gym: Palette = {
  background: '#0F1217',
  surface: '#181C24',
  surfaceAlt: '#212733',
  border: '#2E3644',
  primary: '#2F7DF6',
  onPrimary: '#FFFFFF',
  accent: '#7FB2FF',
  text: '#E8ECF2',
  textMuted: '#8B95A7',
  success: '#3DBE8B',
  danger: '#E5534B',
};

export const PALETTES: Record<TrainingMode, Palette> = { military, gym };

export const MODE_LABELS: Record<TrainingMode, string> = {
  military: 'Modo Militar',
  gym: 'Modo Gimnasio',
};
