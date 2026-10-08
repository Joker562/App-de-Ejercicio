import { SectionList, StyleSheet, Text, View } from 'react-native';

import { GYM_EXERCISES, MUSCLE_GROUPS } from '../../data/data';
import { useTheme } from '../../theme/useTheme';

const SECTIONS = MUSCLE_GROUPS.map((group) => ({
  title: group,
  data: GYM_EXERCISES.filter((e) => e.muscleGroup === group),
})).filter((section) => section.data.length > 0);

export function ExerciseLibraryScreen() {
  const theme = useTheme();
  return (
    <SectionList
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      sections={SECTIONS}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled
      renderSectionHeader={({ section }) => (
        <Text
          style={[styles.header, { color: theme.accent, backgroundColor: theme.background }]}
        >
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => (
        <View style={[styles.item, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
          <Text style={[styles.equipment, { color: theme.textMuted }]}>{item.equipment}</Text>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 32, gap: 8 },
  header: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  name: { fontSize: 16, fontWeight: '600', flex: 1 },
  equipment: { fontSize: 13 },
});
