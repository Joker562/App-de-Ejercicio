import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTheme } from '../theme/useTheme';

interface Props<T extends string> {
  options: { value: T; label: string }[];
  selected: T | null;
  /** null = "Todos". */
  onChange: (value: T | null) => void;
  allLabel?: string;
}

/** Fila horizontal de chips de filtro con opción "Todos". */
export function FilterChips<T extends string>({
  options,
  selected,
  onChange,
  allLabel = 'Todos',
}: Props<T>) {
  const theme = useTheme();
  const items: { value: T | null; label: string }[] = [
    { value: null, label: allLabel },
    ...options,
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <Pressable
            key={item.value ?? '__all'}
            onPress={() => onChange(item.value)}
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
            <Text
              style={[styles.label, { color: isSelected ? theme.onPrimary : theme.text }]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingHorizontal: 16 },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  label: { fontSize: 13, fontWeight: '600' },
});
