import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { fcmTokenApi } from '@/lib/api';
import { useAppSelector } from '@/store';

// Configure foreground notification presentation behaviour once at module load.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Notification data payload shapes sent from the Laravel backend.
 * Each type maps to a specific screen in the mobile app.
 */
type NotificationData =
  | { type: 'todo_assigned'; todo_id: string }
  | { type: 'todo_reminder'; todo_id: string }
  | { type: 'todo_completed'; todo_id: string }
  | { type: 'chore_assigned'; chore_id: string }
  | { type: 'chore_completed'; chore_id: string }
  | { type: 'chore_reminder'; chore_id: string };

/**
 * Register for push notifications, send the device token to the backend,
 * and set up navigation handlers so that tapping a notification opens
 * the relevant screen.
 *
 * Must be called inside a component that has access to expo-router context.
 */
export function usePushNotifications() {
  const user = useAppSelector((s) => s.auth.user);
  const router = useRouter();
  const foregroundListenerRef = useRef<Notifications.EventSubscription | null>(null);
  const responseListenerRef = useRef<Notifications.EventSubscription | null>(null);
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    let cancelled = false;

    // 1. Request permissions and register the push token with the backend.
    (async () => {
      try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        let finalStatus = existing;

        if (existing !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted' || cancelled) {
          return;
        }

        const tokenData = await Notifications.getDevicePushTokenAsync();
        const token = tokenData.data;

        if (!cancelled && token && token !== registeredTokenRef.current) {
          await fcmTokenApi.register(token, 'mobile');
          registeredTokenRef.current = token;
        }
      } catch (err) {
        // Notifications may not be available in Expo Go — degrade gracefully.
        console.warn('[usePushNotifications] Failed to register push token:', err);
      }
    })();

    // 2. Handle notifications received while the app is in the foreground.
    foregroundListenerRef.current = Notifications.addNotificationReceivedListener(
      (_notification) => {
        // The notification is already displayed via setNotificationHandler above.
        // Additional in-app handling (e.g. toast) can be added here.
      },
    );

    // 3. Handle taps on notifications (foreground and background).
    responseListenerRef.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as NotificationData;

        if (!data?.type) {
          return;
        }

        switch (data.type) {
          case 'todo_assigned':
          case 'todo_reminder':
          case 'todo_completed':
            router.push('/(tabs)/todos');
            break;
          case 'chore_assigned':
          case 'chore_completed':
          case 'chore_reminder':
            router.push('/(tabs)/chores');
            break;
        }
      },
    );

    return () => {
      cancelled = true;
      foregroundListenerRef.current?.remove();
      responseListenerRef.current?.remove();
    };
  }, [user, router]);

  /**
   * Unregister the device token from the backend (e.g. on logout).
   */
  const unregister = async () => {
    if (registeredTokenRef.current) {
      try {
        await fcmTokenApi.unregister(registeredTokenRef.current);
      } catch (err) {
        // Best-effort — log so we can track if token cleanup is consistently failing.
        console.warn('[usePushNotifications] Failed to unregister push token:', err);
      } finally {
        registeredTokenRef.current = null;
      }
    }
  };

  return { unregister };
}
