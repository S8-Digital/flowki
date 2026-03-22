import { useCallback, useEffect, useRef, useState } from 'react';
import { REMOTE_CONFIG_DEFAULTS, getRemoteConfigInstance, rcBoolean, rcJson, rcString } from '@/lib/firebase-remote-config';

interface RemoteConfigState {
    /** True while the first fetch is in progress */
    isLoading: boolean;
    /** True once Remote Config values have been fetched (or failed) */
    isReady: boolean;
    /** Convenience: read a string value that re-renders when Remote Config updates */
    getString: (key: string) => string;
    /** Convenience: read a boolean flag */
    getBoolean: (key: string) => boolean;
    /** Convenience: read and parse a JSON string value */
    getJson: <T>(key: string, fallback: T) => T;
    /** Epoch timestamp of the last successful fetch (0 = not yet fetched) */
    lastFetchedAt: number;
}

/**
 * Hook that exposes Firebase Remote Config values as reactive state.
 *
 * - Renders immediately with defaults so there is no content flash.
 * - Fetches from Firebase in the background on first mount.
 * - Re-renders components once fresh config is activated.
 * - Safe to call in SSR — returns defaults without touching Firebase.
 *
 * Usage:
 * ```tsx
 * const { getString } = useRemoteConfig();
 * const headline = getString('welcome_hero_headline');
 * ```
 */
export function useRemoteConfig(): RemoteConfigState {
    const [version, setVersion] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [lastFetchedAt, setLastFetchedAt] = useState(0);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) {
            return;
        }

        fetchedRef.current = true;

        const rc = getRemoteConfigInstance();

        if (!rc) {
            setIsReady(true);

            return;
        }

        setIsLoading(true);

        import('firebase/remote-config')
            .then(({ fetchAndActivate }) => fetchAndActivate(rc))
            .then(() => {
                setLastFetchedAt(Date.now());
                setVersion((v) => v + 1);
            })
            .catch(() => {
                // Silently fall back to defaults if fetch fails
            })
            .finally(() => {
                setIsLoading(false);
                setIsReady(true);
            });
    }, []);

    // `version` is included in each dependency array so getters are re-created
    // (and callers re-render) after every successful Remote Config fetch.
    const getString = useCallback((key: string) => rcString(key), [version]); // eslint-disable-line react-hooks/exhaustive-deps
    const getBoolean = useCallback((key: string) => rcBoolean(key), [version]); // eslint-disable-line react-hooks/exhaustive-deps
    const getJson = useCallback(<T>(key: string, fallback: T): T => rcJson(key, fallback), [version]); // eslint-disable-line react-hooks/exhaustive-deps

    return { isLoading, isReady, getString, getBoolean, getJson, lastFetchedAt };
}

/**
 * Returns the hardcoded default value for a Remote Config key.
 * Useful when you need a value synchronously at module level (e.g. for SSR).
 */
export function getRemoteConfigDefault(key: string): string | boolean | number {
    return REMOTE_CONFIG_DEFAULTS[key] ?? '';
}
