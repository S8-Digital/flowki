import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import type { Messaging, MessagePayload } from 'firebase/messaging';
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

export async function getFcmToken(): Promise<string | null> {
    const messagingInstance = getFirebaseMessaging();

    if (!messagingInstance) {
        return null;
    }

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
        console.warn('VITE_FIREBASE_VAPID_KEY is not set.');

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
