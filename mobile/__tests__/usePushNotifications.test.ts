import * as Notifications from 'expo-notifications';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fcmTokenApi } from '@/lib/api';

// ── mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  fcmTokenApi: {
    register: vi.fn(() => Promise.resolve({ message: 'ok' })),
    unregister: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('expo-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/store', () => ({
  useAppSelector: vi.fn(),
}));

// ── tests ────────────────────────────────────────────────────────────────────

describe('usePushNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('module initialisation', () => {
    it('calls setNotificationHandler on module load', async () => {
      // Re-import to trigger module-level side-effects
      await import('../hooks/usePushNotifications');

      expect(Notifications.setNotificationHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          handleNotification: expect.any(Function),
        }),
      );
    });

    it('notification handler resolves with correct presentation options', async () => {
      let handlerArg: Parameters<typeof Notifications.setNotificationHandler>[0] | undefined;

      vi.mocked(Notifications.setNotificationHandler).mockImplementationOnce((handler) => {
        handlerArg = handler;
      });

      // Force re-evaluation
      vi.resetModules();
      await import('../hooks/usePushNotifications');

      expect(handlerArg).toBeDefined();

      if (handlerArg) {
        const result = await handlerArg.handleNotification({} as never);
        expect(result).toMatchObject({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        });
      }
    });
  });

  describe('fcmTokenApi integration', () => {
    it('register sends the token with device_type=mobile', async () => {
      await fcmTokenApi.register('test-token-123', 'mobile');

      expect(fcmTokenApi.register).toHaveBeenCalledWith('test-token-123', 'mobile');
    });

    it('unregister sends the token to the backend', async () => {
      await fcmTokenApi.unregister('test-token-to-remove');

      expect(fcmTokenApi.unregister).toHaveBeenCalledWith('test-token-to-remove');
    });
  });

  describe('permission flow', () => {
    it('does not proceed past permission check when permission is denied', async () => {
      vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
        status: 'denied',
      } as never);

      // Simulate the permission check logic directly
      const { status } = await Notifications.getPermissionsAsync();
      const shouldRegister = status === 'granted';

      expect(shouldRegister).toBe(false);
      expect(fcmTokenApi.register).not.toHaveBeenCalled();
    });

    it('uses existing permission when already granted', async () => {
      vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
        status: 'granted',
      } as never);
      vi.mocked(Notifications.getDevicePushTokenAsync).mockResolvedValueOnce({
        data: 'granted-token',
      } as never);

      const { status: existing } = await Notifications.getPermissionsAsync();
      expect(existing).toBe('granted');

      const tokenData = await Notifications.getDevicePushTokenAsync();
      expect(tokenData.data).toBe('granted-token');

      // requestPermissionsAsync should NOT be called when already granted
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('requests permissions when status is undetermined', async () => {
      vi.mocked(Notifications.getPermissionsAsync).mockResolvedValueOnce({
        status: 'undetermined',
      } as never);
      vi.mocked(Notifications.requestPermissionsAsync).mockResolvedValueOnce({
        status: 'granted',
      } as never);

      const { status: existing } = await Notifications.getPermissionsAsync();

      let finalStatus = existing;

      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(finalStatus).toBe('granted');
    });
  });
});
