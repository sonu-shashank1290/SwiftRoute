import '@/global.css';

import { ActivityIndicator, View } from 'react-native';
import { Stack, Redirect, useSegments } from 'expo-router';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { store, persistor } from '@/store';
import type { RootState } from '@/store';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { seedDatabase } from '@/storage/seed';
import { useEffect } from 'react';

function ProtectedLayout() {
  const segments = useSegments();

  const {
    isAuthenticated,
    role,
  } = useSelector((s: RootState) => s.auth);

  const currentGroup = segments[0];

  // not logged in
  if (!isAuthenticated && currentGroup !== '(auth)') {
    return <Redirect href="/(auth)/login" />;
  }

  // driver trying to access user routes
  if (
    isAuthenticated &&
    role === 'driver' &&
    currentGroup === '(user)'
  ) {
    return <Redirect href="/(driver)" />;
  }

  // user trying to access driver routes
  if (
    isAuthenticated &&
    role === 'user' &&
    currentGroup === '(driver)'
  ) {
    return <Redirect href="/(user)" />;
  }

  // logged in user opening auth pages
  if (
    isAuthenticated &&
    currentGroup === '(auth)'
  ) {
    return (
      <Redirect
        href={role === 'driver' ? '/(driver)' : '/(user)'}
      />
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(driver)/index" />
      <Stack.Screen name="(user)" />
    </Stack>
  );
}

function AppContent() {

  useEffect(() => {
    seedDatabase();
  }, []);

  return (
    <GluestackUIProvider mode="dark">
      <ProtectedLayout />
    </GluestackUIProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <PersistGate
        persistor={persistor}
        loading={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#0f0f14',
            }}
          >
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        }
      >
        <AppContent />
      </PersistGate>
    </Provider>
  );
}