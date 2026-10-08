import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { useTheme } from '../theme/useTheme';

export interface LinePoint {
  /** Etiqueta del eje X (p. ej. "12/10"). */
  label: string;
  value: number;
}

export interface LineSeries {
  name: string;
  color: string;
  points: LinePoint[];
}

// Coordenadas internas del SVG: se escala al ancho disponible con viewBox,
// así no hace falta medir el contenedor (onLayout) antes de dibujar.
const WIDTH = 340;
const HEIGHT = 190;
const PAD = { top: 14, right: 12, bottom: 22, left: 40 };

/**
 * Gráfico de líneas simple, con una o varias series sobre las mismas
 * etiquetas de X. Muestra máximo y mínimo en el eje Y y la primera, la del
 * medio y la última etiqueta en el eje X.
 */
export function LineChart({
  series,
  formatValue = (v) => String(Math.round(v)),
}: {
  series: LineSeries[];
  formatValue?: (value: number) => string;
}) {
  const theme = useTheme();
  const width = WIDTH;
  const all = series.flatMap((s) => s.points.map((p) => p.value));
  const count = Math.max(0, ...series.map((s) => s.points.length));

  if (count === 0) {
    return <Text style={[styles.empty, { color: theme.textMuted }]}>Aún no hay datos.</Text>;
  }

  let min = Math.min(...all);
  let max = Math.max(...all);
  if (max - min < 1e-6) {
    // Una línea plana: abre un margen para que se vea centrada.
    min -= 1;
    max += 1;
  }
  const plotW = Math.max(1, width - PAD.left - PAD.right);
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (count === 1 ? plotW / 2 : (i / (count - 1)) * plotW);
  const y = (v: number) => PAD.top + (1 - (v - min) / (max - min)) * plotH;
  const labels = series[0].points.map((p) => p.label);
  const labelIndexes = [...new Set([0, Math.floor((count - 1) / 2), count - 1])];

  return (
    <View>
      <View style={styles.canvas}>
        <Svg width="100%" height="100%" viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          {[max, (max + min) / 2, min].map((v, i) => (
            <Line
              key={`grid-${i}`}
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke={theme.border}
              strokeWidth={1}
              strokeDasharray={i === 2 ? undefined : '4 4'}
            />
          ))}
          {[max, min].map((v, i) => (
            <SvgText
              key={`ylabel-${i}`}
              x={PAD.left - 6}
              y={y(v) + 4}
              fontSize={10}
              fill={theme.textMuted}
              textAnchor="end"
            >
              {formatValue(v)}
            </SvgText>
          ))}
          {labelIndexes.map((i) => (
            <SvgText
              key={`xlabel-${i}`}
              x={x(i)}
              y={HEIGHT - 6}
              fontSize={10}
              fill={theme.textMuted}
              textAnchor={i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle'}
            >
              {labels[i]}
            </SvgText>
          ))}
          {series.map((s) => (
            <Polyline
              key={`line-${s.name}`}
              points={s.points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          ))}
          {series.map((s) =>
            s.points.map((p, i) => (
              <Circle
                key={`dot-${s.name}-${i}`}
                cx={x(i)}
                cy={y(p.value)}
                r={i === s.points.length - 1 ? 4.5 : 3}
                fill={s.color}
              />
            )),
          )}
        </Svg>
      </View>
      {series.length > 1 ? (
        <View style={styles.legend}>
          {series.map((s) => (
            <View key={s.name} style={styles.legendItem}>
              <View style={[styles.swatch, { backgroundColor: s.color }]} />
              <Text style={{ color: theme.textMuted, fontSize: 12 }}>{s.name}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { textAlign: 'center', paddingVertical: 24 },
  canvas: { width: '100%', aspectRatio: WIDTH / HEIGHT },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 12, height: 3, borderRadius: 2 },
});
