import { OfflineIndicator } from '@/components/OfflineIndicator';
import { useAuth } from '@/hooks/useAuth';
import { store } from '@/store';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments, router]);

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
