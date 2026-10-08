import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import type { ComponentProps } from 'react';

import { useTheme } from '../theme/useTheme';
import { DashboardStack } from './DashboardStack';
import { HistoryStack } from './HistoryStack';
import { ProfileStack } from './ProfileStack';
import type { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();

type IconName = ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS: Record<keyof RootTabParamList, IconName> = {
  Inicio: 'barbell',
  Historial: 'stats-chart',
  Perfil: 'person',
};

/** Navegación principal: pestañas Inicio (stack), Historial y Perfil. */
export function AppNavigator() {
  const theme = useTheme();

  const navigationTheme: Theme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: theme.accent,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: theme.surface },
          headerTintColor: theme.text,
          tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: theme.textMuted,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name={TAB_ICONS[route.name]} color={color} size={size} />
          ),
        })}
      >
        <Tab.Screen name="Inicio" component={DashboardStack} options={{ headerShown: false }} />
        <Tab.Screen name="Historial" component={HistoryStack} options={{ headerShown: false }} />
        <Tab.Screen name="Perfil" component={ProfileStack} options={{ headerShown: false }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
