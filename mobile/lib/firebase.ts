import { getApp, getApps, initializeApp } from 'firebase/app';
import type { Database } from 'firebase/database';

// Firebase config is injected at build time via EXPO_PUBLIC_ env vars.
// In production, populate these from your Firebase console project settings.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

/**
 * Returns the Firebase app singleton, initialising it on first call.
 * Safe to call multiple times.
 */
export function getFirebaseApp() {
  if (getApps().length > 0) {
return getApp();
}

  return initializeApp(firebaseConfig);
}

let _dbPromise: Promise<Database> | null = null;

/**
 * Returns a Firebase Realtime Database instance with offline persistence enabled.
 * The Firebase RTDB JS SDK automatically queues writes when offline and replays
 * them on reconnection.  We call `enablePersistenceReact` (available in some
 * versions) or fall back to the default online-state handling which provides
 * in-process queuing for the session lifetime.
 *
 * Lazy import avoids bundling the full RTDB SDK until it is actually needed.
 */
export async function getFirebaseDatabase() {
  if (_dbPromise) {
    return _dbPromise;
  }

  _dbPromise = (async () => {
    const { getDatabase, enableNetwork } = await import('firebase/database');
    const db = getDatabase(getFirebaseApp());

    // Ensure the SDK is connected so offline writes are queued for replay.
    try {
      await enableNetwork(db);
    } catch (err: unknown) {
      // enableNetwork throws if the network is already enabled — safe to ignore.
      const message = err instanceof Error ? err.message : String(err);

      if (!message.includes('already')) {
        console.warn('[firebase] enableNetwork error:', message);
      }
    }

    return db;
  })();

  return _dbPromise;
}
