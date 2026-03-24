import { vi } from 'vitest';

// react-native is aliased to __mocks__/react-native.ts in vitest.config.ts so
// Vite never loads the raw Flow-typed source. No vi.mock needed here.

// ── Firebase database ─────────────────────────────────────────────────────
//
// This global mock MUST live in the setup file (not individual test files) so
// that it is registered before ANY module is loaded — including modules in the
// @flowki/shared workspace that are loaded via alias resolution.
// test-file-level vi.mock() calls are hoisted within that file but do NOT
// propagate to modules that are statically imported from aliased paths outside
// the mobile workspace directory, because Vitest processes those in a separate
// module context. Placing the mock here ensures every import of
// 'firebase/database' in every context receives the stub.
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  onValue: vi.fn(),
  enableNetwork: vi.fn(() => Promise.resolve()),
}));

// Mock Firebase app/database initialiser
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
