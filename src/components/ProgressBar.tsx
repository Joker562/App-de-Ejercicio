import { View } from 'react-native';

import { useTheme } from '../theme/useTheme';

export function ProgressBar({
  progress,
  color,
  height = 8,
}: {
  progress: number;
  color?: string;
  height?: number;
}) {
  const theme = useTheme();
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View
      style={{
        height,
        borderRadius: height / 2,
        backgroundColor: theme.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          backgroundColor: color ?? theme.primary,
        }}
      />
    </View>
  );
}
