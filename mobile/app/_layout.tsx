import { OfflineIndicator } from '@/components/OfflineIndicator';
import { registerBackgroundSync, unregisterBackgroundSync } from '@/hooks/useBackgroundSync';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { store } from '@/store';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { useAuth } from '@/hooks/useAuth';

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { unregister: unregisterPush } = usePushNotifications();

  useEffect(() => {
    if (isLoading) {
return;
}

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

  // Register background sync when logged in; unregister on logout.
  useEffect(() => {
    if (user) {
      registerBackgroundSync();
    } else {
      unregisterBackgroundSync();
      unregisterPush();
    }
  }, [user, unregisterPush]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <StoreProvider store={store}>
      <PaperProvider>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <OfflineIndicator />
        <AuthGuard />
      </PaperProvider>
    </StoreProvider>
  );
}
