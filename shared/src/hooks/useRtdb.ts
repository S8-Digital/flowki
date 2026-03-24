import type { Database } from 'firebase/database';
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
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * Accepts a platform-specific `getDatabase` factory so each workspace can
 * supply its own Firebase initialisation (web vs. Expo).
 *
 * The listener is torn down automatically on unmount or when `path` changes.
 * Pass `null` as `path` to temporarily disable the listener.
 *
 * @example
 * // Web
 * import { getFirebaseDatabase } from '@/lib/firebase-database';
 * const { data } = useRtdb(getFirebaseDatabase, `families/${id}/todos`, {});
 *
 * @example
 * // Mobile
 * import { getFirebaseDatabase } from '@/lib/firebase';
 * const { data } = useRtdb(getFirebaseDatabase, `families/${id}/todos`, {});
 */
export function useRtdb<T>(
    getDatabase: () => Promise<Database>,
    path: string | null,
    initialValue: T,
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
                const { ref, onValue } = await import('firebase/database');
                const db = await getDatabase();
                const dbRef = ref(db, path);

                const unsubscribe = onValue(
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
    }, [path, getDatabase]);

    return { data, isLoading, error };
}

