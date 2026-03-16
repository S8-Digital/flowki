import { router } from '@inertiajs/react';
import type { MessagePayload } from 'firebase/messaging';
import { useCallback, useEffect, useRef, useState } from 'react';
import { store, destroy } from '@/actions/App/Http/Controllers/FcmTokenController';
import { getFcmToken, onForegroundMessage, requestNotificationPermission } from '@/lib/firebase-messaging';

interface UseFirebaseMessagingReturn {
    notificationPermission: NotificationPermission | null;
    fcmToken: string | null;
    isRegistering: boolean;
    requestPermissionAndRegister: () => Promise<void>;
    unregister: () => Promise<void>;
    foregroundMessage: MessagePayload | null;
}

export function useFirebaseMessaging(): UseFirebaseMessagingReturn {
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(
        typeof Notification !== 'undefined' ? Notification.permission : null,
    );
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [foregroundMessage, setForegroundMessage] = useState<MessagePayload | null>(null);
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        const unsubscribe = onForegroundMessage((payload) => {
            setForegroundMessage(payload);
        });

        if (unsubscribe) {
            unsubscribeRef.current = unsubscribe;
        }

        return () => {
            unsubscribeRef.current?.();
        };
    }, []);

    const requestPermissionAndRegister = useCallback(async () => {
        setIsRegistering(true);

        try {
            const permission = await requestNotificationPermission();
            setNotificationPermission(permission);

            if (permission !== 'granted') {
                return;
            }

            const token = await getFcmToken();

            if (!token) {
                return;
            }

            setFcmToken(token);

            router.post(store().url, { token, device_type: 'web' });
        } finally {
            setIsRegistering(false);
        }
    }, []);

    const unregister = useCallback(async () => {
        if (!fcmToken) {
            return;
        }

        router.delete(destroy(fcmToken).url, {
            onSuccess: () => setFcmToken(null),
        });
    }, [fcmToken]);

    return {
        notificationPermission,
        fcmToken,
        isRegistering,
        requestPermissionAndRegister,
        unregister,
        foregroundMessage,
    };
}
