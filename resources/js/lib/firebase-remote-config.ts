import type { RemoteConfig } from 'firebase/remote-config';
import { fetchAndActivate, getBoolean, getRemoteConfig, getString, getValue } from 'firebase/remote-config';
import { getFirebaseApp } from './firebase';
import rawDefaults from './remote-config-defaults.json';

/**
 * All Remote Config keys used in the application.
 * Values are sourced from remote-config-defaults.json — the single source of
 * truth shared with the PHP SyncRemoteConfigCommand.
 *
 * Array/object entries (e.g. *_json keys) are serialised to JSON strings so
 * Firebase Remote Config receives a flat Record<string, string|boolean|number>.
 */
export const REMOTE_CONFIG_DEFAULTS: Record<string, string | boolean | number> = Object.fromEntries(
    Object.entries(rawDefaults).map(([key, value]) => [
        key,
        Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : value,
    ]),
);

// Minimum interval between Remote Config fetches (12 hours in ms)
const FETCH_INTERVAL_MS = 12 * 60 * 60 * 1000;

let remoteConfig: RemoteConfig | null = null;

/**
 * Returns the initialised RemoteConfig singleton.
 * Safe to call multiple times — only initialises once.
 * Returns null in SSR / non-browser environments.
 */
export function getRemoteConfigInstance(): RemoteConfig | null {
    if (typeof window === 'undefined') {
        return null;
    }

    if (!remoteConfig) {
        try {
            remoteConfig = getRemoteConfig(getFirebaseApp());
            remoteConfig.settings.minimumFetchIntervalMillis = FETCH_INTERVAL_MS;
            remoteConfig.defaultConfig = REMOTE_CONFIG_DEFAULTS;
        } catch {
            return null;
        }
    }

    return remoteConfig;
}

/**
 * Fetch and activate the latest Remote Config values.
 * Should be called once on app boot. Failures are silent — defaults are used.
 */
export async function initializeRemoteConfig(): Promise<void> {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return;
    }

    try {
        await fetchAndActivate(rc);
    } catch {
        // Network unavailable or Firebase not configured — defaults remain active
    }
}

/**
 * Returns the string value for a Remote Config key.
 * Falls back to the hardcoded default if the key isn't overridden.
 */
export function rcString(key: string): string {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        const fallback = REMOTE_CONFIG_DEFAULTS[key];

        return typeof fallback === 'string' ? fallback : String(fallback ?? '');
    }

    return getString(rc, key);
}

/**
 * Returns the boolean value for a Remote Config key.
 */
export function rcBoolean(key: string): boolean {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return Boolean(REMOTE_CONFIG_DEFAULTS[key] ?? false);
    }

    return getBoolean(rc, key);
}

/**
 * Returns the parsed JSON value for a Remote Config key that stores a JSON string.
 * Falls back to the hardcoded default on parse failure.
 */
export function rcJson<T>(key: string, fallback: T): T {
    const raw = rcString(key);

    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

/**
 * Returns all current Remote Config values as a plain record.
 * Useful for debugging in the browser console.
 */
export function getAllRemoteConfigValues(): Record<string, string | boolean | number> {
    const rc = getRemoteConfigInstance();

    if (!rc) {
        return { ...REMOTE_CONFIG_DEFAULTS };
    }

    return Object.fromEntries(
        Object.keys(REMOTE_CONFIG_DEFAULTS).map((key) => {
            const val = getValue(rc, key);

            return [key, val.asString()];
        }),
    );
}
