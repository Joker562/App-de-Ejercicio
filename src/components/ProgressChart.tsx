import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';

export interface ChartPoint {
  label: string;
  value: number;
}

const HEIGHT = 180;
const LABEL_SPACE = 20;
const VALUE_SPACE = 16;

/** Gráfico de barras simple (volumen por sesión, repeticiones, etc.). */
export function ProgressChart({
  data,
  formatValue = (v) => String(Math.round(v)),
}: {
  data: ChartPoint[];
  formatValue?: (value: number) => string;
}) {
  const theme = useTheme();
  const [width, setWidth] = useState(0);

  if (data.length === 0) {
    return (
      <Text style={[styles.empty, { color: theme.textMuted }]}>
        Aún no hay datos para mostrar.
      </Text>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const plotHeight = HEIGHT - LABEL_SPACE - VALUE_SPACE;
  const slot = width / data.length;
  const barWidth = Math.min(32, slot * 0.6);

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? (
        <Svg width={width} height={HEIGHT}>
          <Line
            x1={0}
            x2={width}
            y1={HEIGHT - LABEL_SPACE}
            y2={HEIGHT - LABEL_SPACE}
            stroke={theme.border}
            strokeWidth={1}
          />
          {data.map((point, i) => {
            const barHeight = (point.value / max) * plotHeight;
            const x = i * slot + (slot - barWidth) / 2;
            const y = HEIGHT - LABEL_SPACE - barHeight;
            const isLast = i === data.length - 1;
            return (
              <Rect
                key={`bar-${i}`}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                rx={4}
                fill={isLast ? theme.primary : theme.surfaceAlt}
                stroke={theme.primary}
                strokeWidth={isLast ? 0 : 1}
              />
            );
          })}
          {data.map((point, i) => {
            const cx = i * slot + slot / 2;
            const y = HEIGHT - LABEL_SPACE - (point.value / max) * plotHeight;
            return [
              <SvgText
                key={`value-${i}`}
                x={cx}
                y={y - 4}
                fontSize={10}
                fill={theme.textMuted}
                textAnchor="middle"
              >
                {formatValue(point.value)}
              </SvgText>,
              <SvgText
                key={`label-${i}`}
                x={cx}
                y={HEIGHT - 6}
                fontSize={10}
                fill={theme.textMuted}
                textAnchor="middle"
              >
                {point.label}
              </SvgText>,
            ];
          })}
        </Svg>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
});
