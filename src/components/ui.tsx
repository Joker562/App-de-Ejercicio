import type { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../theme/useTheme';

export function Screen({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={styles.screenContent}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const background = {
    primary: theme.primary,
    secondary: theme.surfaceAlt,
    danger: theme.danger,
  }[variant];
  const color = variant === 'secondary' ? theme.text : theme.onPrimary;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        style,
      ]}
    >
      <Text style={[styles.buttonText, { color }]}>{title}</Text>
    </Pressable>
  );
}

/** Fila pulsable con título y subtítulo, usada en listas. */
export function ListItem({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.listItem,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.listTitle, { color: theme.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.listSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  screenContent: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  listTitle: { fontSize: 16, fontWeight: '600' },
  listSubtitle: { fontSize: 13, marginTop: 2 },
});
