import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, Screen, SectionTitle } from '../../components/ui';
import type { DashboardScreenProps } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { useTheme } from '../../theme/useTheme';
import { kgToUnit } from '../../utils/format';
import { BAR_OPTIONS, PLATE_OPTIONS, platesFor, warmupFor } from '../../utils/progression';

/** Colores de competición, del disco más grande al más pequeño. */
const PLATE_COLORS = ['#D93A2B', '#2F6FD6', '#E8C33A', '#3A9E4F', '#F2F2F2', '#2B2B2B', '#B8B8B8'];

function formatNumber(value: number): string {
  return String(Math.round(value * 100) / 100).replace('.', ',');
}

/** Discos por lado para un peso objetivo y series de calentamiento hasta él. */
export function PlateCalculatorScreen({ route }: DashboardScreenProps<'PlateCalculator'>) {
  const theme = useTheme();
  const unit = useAppStore((s) => s.unit);
  const initial = route.params?.weightKg ? kgToUnit(route.params.weightKg, unit) : 0;
  const [targetText, setTargetText] = useState(initial ? formatNumber(initial) : '');
  const [bar, setBar] = useState(BAR_OPTIONS[unit][0]);

  const plates = PLATE_OPTIONS[unit];
  const target = parseFloat(targetText.replace(',', '.')) || 0;
  const load = platesFor(target, bar, plates);
  const warmups = warmupFor(target, bar, unit);
  const maxPlate = plates[0];

  return (
    <Screen>
      <SectionTitle>Peso objetivo ({unit})</SectionTitle>
      <TextInput
        value={targetText}
        onChangeText={setTargetText}
        keyboardType="decimal-pad"
        placeholder={`Ej. ${unit === 'kg' ? '100' : '225'}`}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border }]}
        accessibilityLabel={`Peso objetivo en ${unit}`}
      />

      <SectionTitle>Barra</SectionTitle>
      <View style={styles.chips}>
        {BAR_OPTIONS[unit].map((option) => {
          const selected = option === bar;
          return (
            <Pressable
              key={option}
              onPress={() => setBar(option)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.primary : theme.surface,
                  borderColor: selected ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={{ color: selected ? theme.onPrimary : theme.text, fontWeight: '700' }}>
                {option} {unit}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Discos por lado</Text>
        {target <= 0 ? (
          <Text style={{ color: theme.textMuted }}>Escribe un peso objetivo.</Text>
        ) : target <= bar ? (
          <Text style={{ color: theme.textMuted }}>Sólo la barra ({bar} {unit}).</Text>
        ) : (
          <>
            {/* Dibujo de un lado de la barra: manguito + discos de mayor a menor. */}
            <View style={styles.barbell}>
              <View style={[styles.sleeve, { backgroundColor: theme.textMuted }]} />
              {load.perSide.map((plate, i) => {
                const colorIndex = plates.indexOf(plate);
                return (
                  <View
                    key={i}
                    style={[
                      styles.plate,
                      {
                        height: 36 + (plate / maxPlate) * 64,
                        backgroundColor: PLATE_COLORS[colorIndex] ?? theme.accent,
                        borderColor: theme.background,
                      },
                    ]}
                  />
                );
              })}
              <View style={[styles.sleeveEnd, { backgroundColor: theme.textMuted }]} />
            </View>
            <Text style={[styles.plateList, { color: theme.text }]}>
              {load.perSide.map(formatNumber).join(' + ')} {unit}
            </Text>
            <Text style={{ color: theme.textMuted }}>
              Total cargado: {formatNumber(load.loaded)} {unit}
            </Text>
            {load.remainder > 0 ? (
              <Text style={{ color: theme.danger }}>
                Faltan {formatNumber(load.remainder)} {unit}: no se pueden cargar con los discos
                estándar.
              </Text>
            ) : null}
          </>
        )}
      </Card>

      {warmups.length > 0 ? (
        <>
          <SectionTitle>Calentamiento sugerido</SectionTitle>
          <Card>
            {warmups.map((step, i) => (
              <View key={i} style={styles.warmupRow}>
                <Text style={[styles.warmupIndex, { color: theme.accent }]}>C{i + 1}</Text>
                <Text style={[styles.warmupText, { color: theme.text }]}>
                  {formatNumber(step.weight)} {unit} × {step.reps}
                </Text>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>
                  {platesFor(step.weight, bar, plates).perSide.map(formatNumber).join(' + ') || 'barra'}
                </Text>
              </View>
            ))}
            <Text style={[styles.hint, { color: theme.textMuted }]}>
              Esquema: barra × 10, 40% × 5, 60% × 3 y 80% × 2. Descansa 1 minuto entre series.
            </Text>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, fontSize: 22, fontWeight: '700' },
  chips: { flexDirection: 'row', gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  barbell: { flexDirection: 'row', alignItems: 'center', height: 110, marginVertical: 4 },
  sleeve: { width: 40, height: 10, borderRadius: 2 },
  plate: { width: 14, borderRadius: 3, borderWidth: 1, marginRight: 2 },
  sleeveEnd: { width: 16, height: 10, borderRadius: 2 },
  plateList: { fontSize: 18, fontWeight: '800', fontVariant: ['tabular-nums'] },
  warmupRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 2 },
  warmupIndex: { width: 28, fontWeight: '800' },
  warmupText: { flex: 1, fontSize: 15, fontWeight: '600', fontVariant: ['tabular-nums'] },
  hint: { fontSize: 12, marginTop: 4 },
});
