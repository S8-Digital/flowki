import { getFirebaseDatabase } from '@/lib/firebase';
import { useRtdb as _useRtdb } from '@flowki/shared';
import { onValue, ref } from 'firebase/database';

export type { RtdbFirebaseFns, RtdbState } from '@flowki/shared';

/**
 * Firebase functions imported at the module level so they use the mobile
 * workspace's module context — this means `vi.mock('firebase/database')` in
 * tests correctly intercepts them.  The shared hook receives them as plain
 * function references (no dynamic import needed inside the shared code).
 */
const _fns = { ref, onValue } as const;

/**
 * Subscribe to a Firebase Realtime Database path and keep local state in sync.
 *
 * Thin wrapper around the shared `useRtdb` hook, binding the mobile Firebase
 * database initialiser and platform firebase functions. The listener is torn
 * down automatically on unmount or when `path` changes. Pass `null` as `path`
 * to temporarily disable it.
 *
 * @example
 * const { data: todos } = useRtdb<Record<string, Todo>>(
 *   user ? `families/${user.family_id}/todos` : null,
 *   {},
 * );
 */
export function useRtdb<T>(path: string | null, initialValue: T) {
  return _useRtdb(getFirebaseDatabase, path, initialValue, _fns);
}
