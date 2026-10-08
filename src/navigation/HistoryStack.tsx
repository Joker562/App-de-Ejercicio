import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HistoryScreen } from '../screens/HistoryScreen';
import { SessionDetailScreen } from '../screens/SessionDetailScreen';
import { useTheme } from '../theme/useTheme';
import type { HistoryStackParamList } from './types';

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStack() {
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
      <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Historial' }} />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ title: 'Sesión' }}
      />
    </Stack.Navigator>
  );
}
