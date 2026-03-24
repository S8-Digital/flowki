import { getFirebaseDatabase } from '@/lib/firebase';
import { useRtdb as _useRtdb } from '@flowki/shared';

export type { RtdbState } from '@flowki/shared';

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * Thin wrapper around the shared `useRtdb` hook, binding the mobile Firebase
 * database initialiser. The listener is torn down automatically on unmount or
 * when `path` changes. Pass `null` as `path` to temporarily disable it.
 *
 * @example
 * const { data: todos } = useRtdb<Record<string, Todo>>(
 *   user ? `families/${user.family_id}/todos` : null,
 *   {},
 * );
 */
export function useRtdb<T>(path: string | null, initialValue: T) {
  return _useRtdb(getFirebaseDatabase, path, initialValue);
}
