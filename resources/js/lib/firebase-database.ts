import type { Database } from 'firebase/database';
import { getDatabase } from 'firebase/database';
import { getFirebaseApp } from './firebase';

let db: Database | null = null;
let loggingConfigured = false;

/**
 * Return the Firebase Realtime Database instance.
 *
 * When running in the browser, this will configure optional verbose
 * logging once per session in development environments.
 *
 * This function does not configure offline persistence.
 */
export async function getFirebaseDatabase(): Promise<Database> {
    if (!db) {
        db = getDatabase(getFirebaseApp());

        if (!loggingConfigured && typeof window !== 'undefined') {
            loggingConfigured = true;

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
