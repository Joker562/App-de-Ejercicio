import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BodyMetricsScreen } from '../screens/BodyMetricsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../theme/useTheme';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen
        name="BodyMetrics"
        component={BodyMetricsScreen}
        options={{ title: 'Peso y medidas' }}
      />
    </Stack.Navigator>
  );
}
