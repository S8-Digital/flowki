import type { FirebasePerformance } from 'firebase/performance';
import { getPerformance } from 'firebase/performance';
import { getFirebaseApp } from './firebase';

let performance: FirebasePerformance | null = null;

export function getFirebasePerformance(): FirebasePerformance | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!performance) {
        performance = getPerformance(getFirebaseApp());
    }

    return performance;
}

export function initializePerformanceMonitoring(): void {
    getFirebasePerformance();
}
