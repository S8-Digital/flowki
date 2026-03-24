import type { FirebaseApp } from 'firebase/app';
import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import type { FirebaseConfig } from '@/types';

let firebaseApp: FirebaseApp | null = null;

export function initFirebaseApp(config: FirebaseConfig): FirebaseApp {
    if (!firebaseApp) {
        firebaseApp = initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId,
            measurementId: config.measurementId,
        });

        if (config.recaptchaSiteKey) {
            initializeAppCheck(firebaseApp, {
                provider: new ReCaptchaEnterpriseProvider(config.recaptchaSiteKey),
                isTokenAutoRefreshEnabled: true,
            });
        }
    }

    return firebaseApp;
}

export function getFirebaseApp(): FirebaseApp {
    if (!firebaseApp) {
        throw new Error('Firebase has not been initialized. Call initFirebaseApp() first.');
    }

    return firebaseApp;
}
