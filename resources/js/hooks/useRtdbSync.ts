import { useEffect, useRef, useState } from 'react';
import { getFirebaseDatabase } from '@/lib/firebase-database';

interface RtdbSyncState<T> {
    /** Live data from the RTDB path, or the initial value while loading */
    data: T;
    /** True while the first snapshot has not yet arrived */
    isLoading: boolean;
    /** Any error that occurred while setting up the listener */
    error: Error | null;
}

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * The listener is torn down automatically when the component unmounts or when
 * `path` changes.  Pass `null` as `path` to temporarily disable the listener.
 *
 * @example
 * const { data: todos, isLoading } = useRtdbSync<Record<string, Todo>>(
 *   `families/${familyId}/todos`,
 *   {},
 * );
 */
export function useRtdbSync<T>(path: string | null, initialValue: T): RtdbSyncState<T> {
    const [data, setData] = useState<T>(initialValue);
    const [isLoading, setIsLoading] = useState(path !== null);
    const [error, setError] = useState<Error | null>(null);

    // Store the latest initialValue in a ref so the effect closure always
    // uses the current value without needing to be in the dependency array.
    const initialValueRef = useRef<T>(initialValue);
    initialValueRef.current = initialValue;

    // Keep refs so we can clean up the listener on unmount / path change
    const unsubscribeRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        // Clean up any previous listener
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
                const db = await getFirebaseDatabase();
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

                // The effect may have been cleaned up while the async imports
                // were in-flight. Immediately unsubscribe if that happened to
                // avoid a leaked listener on an old path.
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
    }, [path]);

    return { data, isLoading, error };
}
