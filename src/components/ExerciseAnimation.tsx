import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { IMAGE_MIRRORS, exerciseImageUrls } from '../data/exercises';
import { useTheme } from '../theme/useTheme';
import type { Exercise } from '../types';

const FADE_MS = 450;
const HOLD_MS = 750;

interface Props {
  exercise: Exercise;
  /** false = sólo la foto inicial (miniaturas de listas). */
  animated?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * "Animación" del ejercicio: funde en bucle la foto de la posición inicial
 * con la de la posición final. Las fotos se cachean en disco tras la primera
 * carga (expo-image), así que luego se ven sin conexión.
 */
export function ExerciseAnimation({ exercise, animated = true, style }: Props) {
  const theme = useTheme();
  // Si una foto falla en un origen, se prueba el siguiente (CDN -> GitHub).
  const [mirror, setMirror] = useState(0);
  const [start, end] = exerciseImageUrls(exercise, mirror);
  const [failed, setFailed] = useState(false);
  const handleError = () => {
    if (mirror < IMAGE_MIRRORS.length - 1) setMirror(mirror + 1);
    else setFailed(true);
  };
  const [paused, setPaused] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  const canAnimate = animated && !!end && !failed;

  useEffect(() => {
    if (!canAnimate || paused) return;
    const useNativeDriver = Platform.OS !== 'web';
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(HOLD_MS),
        Animated.timing(progress, {
          toValue: 1,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
        Animated.delay(HOLD_MS),
        Animated.timing(progress, {
          toValue: 0,
          duration: FADE_MS,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [canAnimate, paused, progress]);

  if (!start || failed) {
    return (
      <View style={[styles.frame, styles.fallback, { backgroundColor: theme.surfaceAlt }, style]}>
        <Ionicons name="image-outline" size={animated ? 36 : 20} color={theme.textMuted} />
        {animated ? (
          <Text style={[styles.fallbackText, { color: theme.textMuted }]}>
            {start ? 'No se pudo cargar la imagen. Revisa tu conexión.' : 'Este ejercicio no tiene imagen.'}
          </Text>
        ) : null}
      </View>
    );
  }

  const content = (
    <View style={[styles.frame, style]}>
      <Image
        source={start}
        style={StyleSheet.absoluteFill}
        contentFit="contain"
        cachePolicy="disk"
        transition={150}
        recyclingKey={exercise.id}
        onError={handleError}
        accessibilityLabel={`${exercise.name}: posición inicial`}
      />
      {canAnimate ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: progress }]}>
          <Image
            source={end}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            cachePolicy="disk"
            onError={handleError}
            accessibilityLabel={`${exercise.name}: posición final`}
          />
        </Animated.View>
      ) : null}
    </View>
  );

  if (!canAnimate) return content;

  return (
    <Pressable
      onPress={() => setPaused((p) => !p)}
      accessibilityRole="button"
      accessibilityLabel={paused ? 'Reanudar animación' : 'Pausar animación'}
    >
      {content}
      {paused ? (
        <View style={styles.pausedBadge}>
          <Ionicons name="play" size={14} color="#FFFFFF" />
          <Text style={styles.pausedText}>En pausa</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: {
    // Las fotos de la base son 3:2 con fondo blanco.
    aspectRatio: 3 / 2,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  fallback: { alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12 },
  fallbackText: { fontSize: 13, textAlign: 'center' },
  pausedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pausedText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
});
