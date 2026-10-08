import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/useTheme';
import type { Session } from '../types';
import { DAY_MS, sessionsPerDay, startOfDay } from '../utils/records';

const WEEKS = 15;
const GAP = 3;
const LABEL_WIDTH = 14;
const DAY_LABELS = ['L', '', 'X', '', 'V', '', 'D'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Mapa de calor de las últimas semanas (columnas = semanas de lunes a
 * domingo). Más intenso = más sesiones ese día. Tocar un día lo selecciona.
 * Las columnas son flexibles (sin medir el contenedor) y las celdas cuadradas.
 */
export function CalendarHeatmap({
  sessions,
  selectedDay,
  onSelectDay,
}: {
  sessions: Session[];
  selectedDay: number | null;
  onSelectDay: (day: number | null) => void;
}) {
  const theme = useTheme();
  const perDay = sessionsPerDay(sessions);

  const today = startOfDay(Date.now());
  const daysSinceMonday = (new Date(today).getDay() + 6) % 7;
  const firstMonday = today - daysSinceMonday * DAY_MS - (WEEKS - 1) * 7 * DAY_MS;
  const activeDays = [...perDay.keys()].filter((d) => d >= firstMonday).length;
  const weeks = Array.from({ length: WEEKS }, (_, w) => firstMonday + w * 7 * DAY_MS);

  return (
    <View>
      <View style={[styles.row, { marginLeft: LABEL_WIDTH + GAP }]}>
        {weeks.map((monday, w) => {
          const month = new Date(monday).getMonth();
          const prevMonth = new Date(monday - 7 * DAY_MS).getMonth();
          return (
            <Text key={w} style={[styles.month, { color: theme.textMuted }]} numberOfLines={1}>
              {w === 0 || month !== prevMonth ? MONTHS[month] : ''}
            </Text>
          );
        })}
      </View>
      {/* Una fila por día de la semana: la etiqueta comparte alto con las celdas. */}
      <View style={styles.rows}>
        {DAY_LABELS.map((label, d) => (
          <View key={d} style={styles.row}>
            <View style={styles.labelCell}>
              <Text style={[styles.dayLabel, { color: theme.textMuted }]}>{label}</Text>
            </View>
            {weeks.map((monday, w) => {
              const day = monday + d * DAY_MS;
              const future = day > today;
              const count = perDay.get(day)?.length ?? 0;
              const selected = day === selectedDay;
              return (
                <Pressable
                  key={w}
                  disabled={future || count === 0}
                  onPress={() => onSelectDay(selected ? null : day)}
                  accessibilityLabel={`${new Date(day).toLocaleDateString('es-ES')}: ${count} sesiones`}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: future
                        ? 'transparent'
                        : count === 0
                          ? theme.surfaceAlt
                          : theme.primary,
                      opacity: count === 1 ? 0.6 : 1,
                      borderWidth: selected || day === today ? 2 : 0,
                      borderColor: selected ? theme.text : theme.accent,
                    },
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={[styles.summary, { color: theme.textMuted }]}>
        {activeDays} días entrenados en las últimas {WEEKS} semanas · toca un día para ver sus sesiones
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: GAP },
  row: { flexDirection: 'row', alignItems: 'center', gap: GAP },
  month: { flex: 1, fontSize: 9, overflow: 'visible' },
  cell: { flex: 1, aspectRatio: 1, borderRadius: 3 },
  labelCell: { width: LABEL_WIDTH, justifyContent: 'center' },
  dayLabel: { fontSize: 9 },
  summary: { fontSize: 11, marginTop: 6 },
});
