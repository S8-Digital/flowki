import type { MessagePayload, Messaging } from 'firebase/messaging';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { FirebaseConfig } from '@/types';
import { getFirebaseApp } from './firebase';

let messaging: Messaging | null = null;

export function getFirebaseMessaging(): Messaging | null {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }

    if (!messaging) {
        messaging = getMessaging(getFirebaseApp());
    }

    return messaging;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
    return Notification.requestPermission();
}

export async function getFcmToken(vapidKey: FirebaseConfig['vapidKey']): Promise<string | null> {
    const messagingInstance = getFirebaseMessaging();

    if (!messagingInstance) {
        return null;
    }

    if (!vapidKey) {
        console.warn('Firebase VAPID key is not set.');

        return null;
    }

    try {
        // Register the server-rendered SW which has the Firebase config embedded
        const serviceWorkerRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        return await getToken(messagingInstance, {
            vapidKey,
            serviceWorkerRegistration,
        });
    } catch (error) {
        console.error('Failed to get FCM token:', error);

        return null;
    }
}

export function onForegroundMessage(callback: (payload: MessagePayload) => void): (() => void) | null {
    const messagingInstance = getFirebaseMessaging();

    if (!messagingInstance) {
        return null;
    }

    return onMessage(messagingInstance, callback);
}
