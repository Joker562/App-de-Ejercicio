import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WorkoutCues } from './src/components/WorkoutCues';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useStoresHydrated } from './src/store/useStoresHydrated';
import { setupNotifications } from './src/utils/notifications';
import { prefetchTrainingImages } from './src/utils/prefetchImages';

// La pantalla de inicio nativa se mantiene hasta cargar los datos guardados.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {});
}
setupNotifications();

export default function App() {
  const hydrated = useStoresHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (Platform.OS !== 'web') SplashScreen.hide();
    prefetchTrainingImages();
  }, [hydrated]);

  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <WorkoutCues />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}
