import { getFirebaseDatabase } from '@/lib/firebase';
import { useEffect, useRef, useState } from 'react';

interface RtdbState<T> {
  data: T;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 * The listener is torn down automatically on unmount or when `path` changes.
 * Pass `null` as `path` to temporarily disable the listener.
 *
 * @example
 * const { data: todos } = useRtdb<Record<string, Todo>>(
 *   user ? `families/${user.family_id}/todos` : null,
 *   {},
 * );
 */
export function useRtdb<T>(path: string | null, initialValue: T): RtdbState<T> {
  const [data, setData] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(path !== null);
  const [error, setError] = useState<Error | null>(null);

  // Store the initial value once in a ref so the effect closure can use it
  // without needing it in the dependency array.
  const initialValueRef = useRef<T>(initialValue);

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
        const db = await getFirebaseDatabase();
        const dbRef = ref(db, path);

        const unsub = onValue(
          dbRef,
          (snapshot) => {
            if (!cancelled) {
              setData((snapshot.val() as T) ?? initialValueRef.current);
              setIsLoading(false);
            }
          },
          (err: Error) => {
            if (!cancelled) {
              setError(err);
              setIsLoading(false);
            }
          },
        );

        if (cancelled) {
          unsub();
        } else {
          unsubscribeRef.current = unsub;
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
