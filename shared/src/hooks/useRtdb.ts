import { useEffect, useRef, useState } from 'react';

export interface RtdbState<T> {
    /** Live data from the RTDB path, or the initial value while loading. */
    data: T;
    /** True while the first snapshot has not yet arrived. */
    isLoading: boolean;
    /** Any error that occurred while setting up the listener. */
    error: Error | null;
}

/**
 * Platform-supplied Firebase functions injected by the caller.
 * Using injection keeps the shared hook free of any firebase/database import,
 * which means platform-specific wrappers (mobile, web) can supply properly
 * mocked versions in tests without module-isolation interference.
 */
export interface RtdbFirebaseFns {
    /**
     * Create a DatabaseReference at the given path.
     * Typed as `unknown` so the shared package needs no firebase types.
     */
    ref: (db: unknown, path: string) => unknown;
    /**
     * Subscribe to value changes at a DatabaseReference.
     * Returns an unsubscribe function.
     */
    onValue: (
        ref: unknown,
        callback: (snapshot: { val: () => unknown }) => void,
        onError: (err: Error) => void,
    ) => () => void;
}

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * Accepts a platform-specific `getDatabase` factory and `fns` (the firebase
 * ref/onValue functions) so each workspace can supply its own Firebase
 * initialisation and properly mockable functions in tests.
 *
 * The listener is torn down automatically on unmount or when `path` changes.
 * Pass `null` as `path` to temporarily disable the listener.
 *
 * @example
 * // Mobile (mobile/hooks/useRtdb.ts)
 * import { ref, onValue } from 'firebase/database';
 * import { getFirebaseDatabase } from '@/lib/firebase';
 * export function useRtdb<T>(path, initial) {
 *   return _useRtdb(getFirebaseDatabase, path, initial, { ref, onValue });
 * }
 *
 * @example
 * // Web (resources/js/hooks/useRtdbSync.ts)
 * import { ref, onValue } from 'firebase/database';
 * import { getFirebaseDatabase } from '@/lib/firebase-database';
 * export function useRtdbSync<T>(path, initial) {
 *   return useRtdb(getFirebaseDatabase, path, initial, { ref, onValue });
 * }
 */
export function useRtdb<T>(
    getDatabase: () => Promise<unknown>,
    path: string | null,
    initialValue: T,
    fns: RtdbFirebaseFns,
): RtdbState<T> {
    const [data, setData] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(path !== null);
    const [error, setError] = useState<Error | null>(null);

    const initialValueRef = useRef<T>(initialValue);
    initialValueRef.current = initialValue;

    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        if (unsubscribeRef.current) {
            unsubscribeRef.current();
            unsubscribeRef.current = null;
        }

        if (!path) {
            setIsLoading(false);

            return;
        }

        setIsLoading(true);
        setError(null);

        let cancelled = false;

        (async () => {
            try {
                const db = await getDatabase();
                const dbRef = fns.ref(db, path);

                const unsubscribe = fns.onValue(
                    dbRef,
                    (snapshot) => {
                        if (!cancelled) {
                            setData((snapshot.val() as T) ?? initialValueRef.current);
                            setIsLoading(false);
                        }
                    },
                    (err) => {
                        if (!cancelled) {
                            setError(err);
                            setIsLoading(false);
                        }
                    },
                );

                if (cancelled) {
                    unsubscribe();
                } else {
                    unsubscribeRef.current = unsubscribe;
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err : new Error(String(err)));
                    setIsLoading(false);
                }
            }
        })();

        return () => {
            cancelled = true;

            if (unsubscribeRef.current) {
                unsubscribeRef.current();
                unsubscribeRef.current = null;
            }
        };
    }, [path, getDatabase, fns]);

    return { data, isLoading, error };
}
