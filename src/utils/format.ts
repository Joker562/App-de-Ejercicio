import type { WeightUnit } from '../types';

const LBS_PER_KG = 2.20462;

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function kgToUnit(kg: number, unit: WeightUnit): number {
  const value = unit === 'kg' ? kg : kg * LBS_PER_KG;
  return Math.round(value * 10) / 10;
}

export function unitToKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : value / LBS_PER_KG;
}

/** 75 -> "01:15", 3725 -> "1:02:05". */
export function formatDuration(totalSec: number): string {
  const sec = Math.max(0, Math.floor(totalSec));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** "13:45" -> 825, "1:02:05" -> 3725, "90" -> 90; null si no es válido. */
export function parseDuration(text: string): number | null {
  const parts = text.trim().split(':');
  if (parts.length === 0 || parts.length > 3 || parts.some((p) => !/^\d+$/.test(p))) return null;
  return parts.map(Number).reduce((total, part) => total * 60 + part, 0);
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
