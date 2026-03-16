import { getAnalytics, logEvent } from 'firebase/analytics';
import type { Analytics, EventNameString } from 'firebase/analytics';
import { getFirebaseApp } from './firebase';

let analytics: Analytics | null = null;

export function getFirebaseAnalytics(): Analytics | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!analytics) {
        analytics = getAnalytics(getFirebaseApp());
    }

    return analytics;
}

export function trackEvent(eventName: EventNameString | string, params?: Record<string, unknown>): void {
    const analyticsInstance = getFirebaseAnalytics();

    if (!analyticsInstance) {
        return;
    }

    logEvent(analyticsInstance, eventName as EventNameString, params);
}
