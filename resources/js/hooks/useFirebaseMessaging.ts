import { usePage } from '@inertiajs/react';
import type { MessagePayload } from 'firebase/messaging';
import { useCallback, useEffect, useRef, useState } from 'react';
import { destroy, store } from '@/actions/App/Http/Controllers/FcmTokenController';
import { getFcmToken, onForegroundMessage, requestNotificationPermission } from '@/lib/firebase-messaging';
import { getXsrfToken } from '@/lib/csrf';
import type { AppPageProps } from '@/types';

interface UseFirebaseMessagingReturn {
    notificationPermission: NotificationPermission | null;
    fcmToken: string | null;
    isRegistering: boolean;
    requestPermissionAndRegister: () => Promise<void>;
    unregister: () => Promise<void>;
    foregroundMessage: MessagePayload | null;
}

export function useFirebaseMessaging(): UseFirebaseMessagingReturn {
    const { firebaseConfig } = usePage<AppPageProps>().props;
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

            const token = await getFcmToken(firebaseConfig.vapidKey);

            if (!token) {
                return;
            }

            setFcmToken(token);

            await fetch(store().url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': getXsrfToken(),
                },
                body: JSON.stringify({ token, device_type: 'web' }),
            });
        } finally {
            setIsRegistering(false);
        }
    }, [firebaseConfig.vapidKey]);

    const unregister = useCallback(async () => {
        if (!fcmToken) {
            return;
        }

        await fetch(destroy(fcmToken).url, {
            method: 'DELETE',
            headers: {
                'X-XSRF-TOKEN': getXsrfToken(),
            },
        });
        setFcmToken(null);
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
