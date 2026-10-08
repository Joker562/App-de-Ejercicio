import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { LineChart } from '../components/LineChart';
import { Button, Card, Screen, SectionTitle } from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { useBodyStore } from '../store/useBodyStore';
import { useTheme } from '../theme/useTheme';
import type { BodyEntry } from '../types';
import { confirmAction, notify } from '../utils/dialogs';
import { formatDate, kgToUnit, unitToKg } from '../utils/format';

type MetricKey = 'weightKg' | 'bodyFatPct' | 'waistCm' | 'chestCm' | 'armCm' | 'thighCm';

const CHART_ENTRIES = 20;

function shortDate(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

function parseNumber(text: string): number | undefined {
  const value = parseFloat(text.replace(',', '.'));
  return Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Registro de peso corporal y medidas con su evolución. */
export function BodyMetricsScreen() {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const entries = useBodyStore((s) => s.entries);
  const addEntry = useBodyStore((s) => s.addEntry);
  const removeEntry = useBodyStore((s) => s.removeEntry);

  const metrics: { key: MetricKey; label: string; suffix: string }[] = [
    { key: 'weightKg', label: 'Peso', suffix: unit },
    { key: 'bodyFatPct', label: '% grasa', suffix: '%' },
    { key: 'waistCm', label: 'Cintura', suffix: 'cm' },
    { key: 'chestCm', label: 'Pecho', suffix: 'cm' },
    { key: 'armCm', label: 'Brazo', suffix: 'cm' },
    { key: 'thighCm', label: 'Muslo', suffix: 'cm' },
  ];

  const [form, setForm] = useState<Record<MetricKey, string>>({
    weightKg: '',
    bodyFatPct: '',
    waistCm: '',
    chestCm: '',
    armCm: '',
    thighCm: '',
  });
  const [chartMetric, setChartMetric] = useState<MetricKey>('weightKg');

  const display = (key: MetricKey, value: number) =>
    key === 'weightKg' ? kgToUnit(value, unit) : Math.round(value * 10) / 10;

  const save = () => {
    const values: Omit<BodyEntry, 'id' | 'date'> = {};
    for (const { key } of metrics) {
      const value = parseNumber(form[key]);
      if (value === undefined) continue;
      values[key] = key === 'weightKg' ? unitToKg(value, unit) : value;
    }
    if (Object.keys(values).length === 0) {
      notify('Sin datos', 'Escribe al menos el peso o una medida.');
      return;
    }
    addEntry(values);
    setForm({ weightKg: '', bodyFatPct: '', waistCm: '', chestCm: '', armCm: '', thighCm: '' });
  };

  const confirmDelete = (entry: BodyEntry) =>
    confirmAction({
      title: 'Eliminar registro',
      message: `¿Eliminar el registro del ${formatDate(entry.date)}?`,
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: () => removeEntry(entry.id),
    });

  const selected = metrics.find((m) => m.key === chartMetric)!;
  const withValue = [...entries]
    .filter((e) => e[selected.key] !== undefined)
    .slice(0, CHART_ENTRIES)
    .reverse();
  const first = withValue[0]?.[selected.key];
  const last = withValue[withValue.length - 1]?.[selected.key];
  const change =
    first !== undefined && last !== undefined && withValue.length > 1
      ? Math.round((display(selected.key, last) - display(selected.key, first)) * 10) / 10
      : null;

  return (
    <Screen>
      <SectionTitle>Nuevo registro</SectionTitle>
      <Card>
        <View style={styles.formGrid}>
          {metrics.map((metric) => (
            <View key={metric.key} style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: theme.textMuted }]}>
                {metric.label} ({metric.suffix})
              </Text>
              <TextInput
                value={form[metric.key]}
                onChangeText={(text) => setForm((f) => ({ ...f, [metric.key]: text }))}
                keyboardType="decimal-pad"
                placeholder="—"
                placeholderTextColor={theme.textMuted}
                accessibilityLabel={`${metric.label} en ${metric.suffix}`}
                style={[
                  styles.input,
                  { color: theme.text, backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={[styles.hint, { color: theme.textMuted }]}>
          Todo es opcional. Pésate siempre en condiciones parecidas (p. ej. por la mañana, en ayunas).
        </Text>
        <Button title="Guardar registro" onPress={save} />
      </Card>

      <SectionTitle>Evolución</SectionTitle>
      <View style={styles.chips}>
        {metrics.map((metric) => {
          const isSelected = metric.key === chartMetric;
          return (
            <Pressable
              key={metric.key}
              onPress={() => setChartMetric(metric.key)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={{ color: isSelected ? theme.onPrimary : theme.text, fontWeight: '600', fontSize: 13 }}>
                {metric.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Card>
        <Text style={[styles.chartTitle, { color: theme.text }]}>
          {selected.label} ({selected.suffix})
          {change !== null ? (
            <Text style={{ color: theme.textMuted, fontWeight: '400' }}>
              {'  '}
              {change > 0 ? '+' : ''}
              {change} {selected.suffix} en {withValue.length} registros
            </Text>
          ) : null}
        </Text>
        <LineChart
          series={[
            {
              name: selected.label,
              color: theme.accent,
              points: withValue.map((e) => ({
                label: shortDate(e.date),
                value: display(selected.key, e[selected.key]!),
              })),
            },
          ]}
          formatValue={(v) => String(Math.round(v * 10) / 10)}
        />
      </Card>

      <SectionTitle>Registros ({entries.length})</SectionTitle>
      {entries.length === 0 ? (
        <Text style={[styles.empty, { color: theme.textMuted }]}>Aún no hay registros.</Text>
      ) : (
        entries.map((entry) => (
          <View
            key={entry.id}
            style={[styles.entry, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.entryDate, { color: theme.text }]}>{formatDate(entry.date)}</Text>
              <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                {metrics
                  .filter((m) => entry[m.key] !== undefined)
                  .map((m) => `${m.label} ${display(m.key, entry[m.key]!)} ${m.suffix}`)
                  .join(' · ')}
              </Text>
            </View>
            <Pressable
              onPress={() => confirmDelete(entry)}
              hitSlop={8}
              accessibilityLabel={`Eliminar registro del ${formatDate(entry.date)}`}
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </Pressable>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  formGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  formField: { width: '47%', gap: 4 },
  fieldLabel: { fontSize: 12 },
  input: { borderWidth: 1, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, fontSize: 16 },
  hint: { fontSize: 11 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  empty: { textAlign: 'center', paddingVertical: 16 },
  entry: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  entryDate: { fontSize: 15, fontWeight: '700' },
});
