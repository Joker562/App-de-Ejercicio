import * as Speech from 'expo-speech';
import { useEffect, useRef } from 'react';

import { useAppStore } from '../store/useAppStore';

/** Dice el texto en español si los avisos de voz están activados. */
export function speak(text: string) {
  if (!useAppStore.getState().voiceCues) return;
  try {
    Speech.speak(text, { language: 'es-ES', rate: 1.05 });
  } catch {
    // Sin motor de voz (p. ej. algunos navegadores): se ignora.
  }
}

/**
 * Cuenta atrás hablada "3, 2, 1" en los últimos segundos de una fase.
 * `phaseKey` identifica la fase para no repetir números al cambiar de una a otra.
 */
export function useSpokenCountdown(remainingSec: number, running: boolean, phaseKey: string) {
  const lastSpoken = useRef<string | null>(null);
  const second = Math.ceil(remainingSec);
  useEffect(() => {
    if (!running || second < 1 || second > 3) return;
    const key = `${phaseKey}-${second}`;
    if (lastSpoken.current === key) return;
    lastSpoken.current = key;
    speak(String(second));
  }, [second, running, phaseKey]);
}
