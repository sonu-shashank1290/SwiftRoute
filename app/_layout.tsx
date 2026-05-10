import '@/global.css';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/store';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import type { RootState } from '@/store';
import { ActivityIndicator } from 'react-native';
import { seedDatabase } from '@/services/storage/seed';

function RouteGuard() {
  const router = useRouter();
  const { isAuthenticated, role } = useSelector((s: RootState) => s.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated) {
      role === 'driver'
        ? router.replace('/(driver)')
        : router.replace('/(user)');
    }
  }, [isAuthenticated, role]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(user)" />
      <Stack.Screen name="(driver)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={<ActivityIndicator />} persistor={persistor}>
        <GluestackUIProvider mode="dark">
          <RouteGuard />
        </GluestackUIProvider>
      </PersistGate>
    </Provider>
  );
}