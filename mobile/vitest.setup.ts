import { vi } from 'vitest';

// Mock react-native to prevent Vitest from loading the raw react-native
// package which contains Flow-type annotations (import typeof *) that Node.js
// cannot parse.  @testing-library/react-native transitively imports it, so
// this mock must be registered before any test file loads that library.
vi.mock('react-native', async () => {
  const React = await import('react');

  const View = (props: Record<string, unknown>) => React.createElement('div', props);
  const Text = (props: Record<string, unknown>) => React.createElement('span', props);
  const StyleSheet = { create: (s: unknown) => s, flatten: (s: unknown) => s };
  const Dimensions = { get: () => ({ width: 375, height: 667 }) };
  const Platform = { OS: 'ios', select: (m: Record<string, unknown>) => m.ios ?? m.default };
  const Animated = {
    Value: class {
      constructor(v: number) { return v as unknown as object; }
    },
    View,
    Text,
    createAnimatedComponent: (c: unknown) => c,
    timing: () => ({ start: vi.fn() }),
    spring: () => ({ start: vi.fn() }),
  };

  return {
    default: { View, Text, StyleSheet, Dimensions, Platform, Animated },
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    Animated,
    TouchableOpacity: View,
    TouchableHighlight: View,
    TouchableWithoutFeedback: View,
    Pressable: View,
    ScrollView: View,
    FlatList: View,
    SectionList: View,
    Image: View,
    TextInput: View,
    Switch: View,
    Modal: View,
    ActivityIndicator: View,
    SafeAreaView: View,
    KeyboardAvoidingView: View,
    InteractionManager: { runAfterInteractions: (cb: () => void) => cb() },
    Linking: { openURL: vi.fn(), addEventListener: vi.fn() },
    Alert: { alert: vi.fn() },
    Keyboard: { dismiss: vi.fn(), addListener: vi.fn(() => ({ remove: vi.fn() })) },
    useColorScheme: vi.fn(() => 'light'),
  };
});

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  getFirebaseDatabase: vi.fn(),
}));

// Mock expo-secure-store
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

// Mock @react-native-community/netinfo
vi.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: vi.fn(() => vi.fn()),
    fetch: vi.fn(() => Promise.resolve({ isConnected: true })),
  },
}));

// Mock expo-notifications
vi.mock('expo-notifications', () => ({
  setNotificationHandler: vi.fn(),
  getPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: vi.fn(() => Promise.resolve({ status: 'granted' })),
  getDevicePushTokenAsync: vi.fn(() => Promise.resolve({ data: 'test-token' })),
  addNotificationReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
}));

// Mock expo-background-fetch
vi.mock('expo-background-fetch', () => ({
  registerTaskAsync: vi.fn(() => Promise.resolve()),
  unregisterTaskAsync: vi.fn(() => Promise.resolve()),
  BackgroundFetchResult: {
    NewData: 'newData',
    NoData: 'noData',
    Failed: 'failed',
  },
}));

// Mock expo-task-manager
vi.mock('expo-task-manager', () => ({
  defineTask: vi.fn(),
  isTaskRegisteredAsync: vi.fn(() => Promise.resolve(false)),
}));
