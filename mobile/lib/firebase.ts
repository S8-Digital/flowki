import { getApp, getApps, initializeApp } from 'firebase/app';

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

/** Returns a Firebase Realtime Database instance (lazy import avoids bundling
 * the full RTDB SDK until it is actually needed). */
export async function getFirebaseDatabase() {
  const { getDatabase } = await import('firebase/database');

  return getDatabase(getFirebaseApp());
}
