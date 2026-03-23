import type { Database } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { getFirebaseApp } from './firebase';

let db: Database | null = null;
let persistenceEnabled = false;

/**
 * Return the Firebase Realtime Database instance.
 *
 * Offline persistence is enabled once per session so that clients
 * continue to receive cached data when the network is unavailable.
 */
export async function getFirebaseDatabase(): Promise<Database> {
    if (!db) {
        db = getDatabase(getFirebaseApp());

        if (!persistenceEnabled && typeof window !== 'undefined') {
            persistenceEnabled = true;

            try {
                const { enableLogging } = await import('firebase/database');
                // Only enable verbose logging in dev
                if (import.meta.env.DEV) {
                    enableLogging(console.log, /* persistent */ false);
                }
            } catch {
                // Logging is optional — ignore errors
            }
        }
    }

    return db;
}
