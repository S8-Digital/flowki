import { onValue, ref } from 'firebase/database';
import { getFirebaseDatabase } from '@/lib/firebase-database';
import { useRtdb } from '@flowki/shared';

export type { RtdbState } from '@flowki/shared';

/**
 * Firebase functions imported at module level so the web workspace's module
 * context applies (enabling `vi.mock('firebase/database')` to work in tests).
 */
const _fns = { ref, onValue } as const;

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * Thin wrapper around the shared `useRtdb` hook, binding the web Firebase
 * database initialiser. The listener is torn down automatically on unmount or
 * when `path` changes. Pass `null` as `path` to temporarily disable it.
 *
 * @example
 * const { data: todos, isLoading } = useRtdbSync<Record<string, Todo>>(
 *   `families/${familyId}/todos`,
 *   {},
 * );
 */
export function useRtdbSync<T>(path: string | null, initialValue: T) {
    return useRtdb(getFirebaseDatabase, path, initialValue, _fns);
}
