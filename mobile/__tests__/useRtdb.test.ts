/**
 * Tests for mobile/hooks/useRtdb.ts — the mobile wrapper around the shared
 * @flowki/shared useRtdb hook.
 *
 * Module isolation note:
 * The shared hook receives `ref` and `onValue` as plain function parameters
 * (injected by the mobile wrapper from the mobile workspace's import of
 * firebase/database). This means vi.mock('firebase/database') in the mobile
 * workspace's global setup (vitest.setup.ts) correctly intercepts those
 * imports — there is no cross-workspace module isolation problem.
 */

import { getFirebaseDatabase } from '@/lib/firebase';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ref as fbRef, onValue as fbOnValue } from 'firebase/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { useRtdb } from '@/hooks/useRtdb';

// ── per-test mock state ─────────────────────────────────────────────────────

interface FirebaseMocks {
  listeners: Map<string, (snapshot: unknown) => void>;
  errorListeners: Map<string, (err: Error) => void>;
  unsubscribers: Map<string, Mock>;
  emit: (path: string, value: unknown) => void;
  emitError: (path: string, err: Error) => void;
}

function makeFirebaseMocks(): FirebaseMocks {
  const listeners = new Map<string, (snapshot: unknown) => void>();
  const errorListeners = new Map<string, (err: Error) => void>();
  const unsubscribers = new Map<string, Mock>();

  const emit = (path: string, value: unknown) => {
    const listener = listeners.get(path);

    if (!listener) {
      throw new Error(`No listener registered for path: ${path}`);
    }

    listener({ val: () => value });
  };

  const emitError = (path: string, err: Error) => {
    const listener = errorListeners.get(path);

    if (!listener) {
      throw new Error(`No error listener registered for path: ${path}`);
    }

    listener(err);
  };

  return { listeners, errorListeners, unsubscribers, emit, emitError };
}

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Wait until the RTDB listener has been registered for the given path.
 *
 * The hook calls `await getDatabase()` (one async hop) before calling onValue.
 * `waitFor` polls with real timers and wraps each check in `act`, making it
 * the most reliable way to wait for the async effect to settle.
 */
const waitForListener = (path: string) =>
  waitFor(() => expect(mocks.unsubscribers.has(path)).toBe(true));

// ── mock setup ──────────────────────────────────────────────────────────────

// `firebase/database` (ref + onValue) is mocked globally in vitest.setup.ts.
// The mobile wrapper (hooks/useRtdb.ts) imports ref/onValue at module level
// from firebase/database (mobile workspace import → mock applies), then passes
// them to the shared hook. Here we configure their per-test behaviour.

let mocks: FirebaseMocks = makeFirebaseMocks();

beforeEach(() => {
  mocks = makeFirebaseMocks();

  vi.mocked(getFirebaseDatabase).mockResolvedValue({} as never);

  vi.mocked(fbRef).mockImplementation((_db: unknown, path: string) => ({ path } as never));

  vi.mocked(fbOnValue).mockImplementation(
    (
      dbRef: { path: string },
      success: (snap: unknown) => void,
      onError: (e: Error) => void,
    ) => {
      mocks.listeners.set(dbRef.path, success);
      mocks.errorListeners.set(dbRef.path, onError);
      const unsub = vi.fn();
      mocks.unsubscribers.set(dbRef.path, unsub);

      return unsub;
    },
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

// ── tests ───────────────────────────────────────────────────────────────────

describe('useRtdb', () => {
  it('starts in a loading state when path is provided', async () => {
    const { result } = renderHook(() => useRtdb('families/1/todos', {}));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toEqual({});
    expect(result.current.error).toBeNull();
  });

  it('returns the initial value immediately when path is null', () => {
    const { result } = renderHook(() => useRtdb<string[]>(null, []));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('updates data when the RTDB snapshot fires', async () => {
    const path = 'families/1/todos';
    const { result } = renderHook(() => useRtdb<Record<string, { title: string }>>(path, {}));

    // Wait for the async Firebase setup (getDatabase) to complete.
    await waitForListener(path);

    const snapshot = { 1: { title: 'Buy milk' } };
    await act(async () => {
      mocks.emit(path, snapshot);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(snapshot);
    expect(result.current.error).toBeNull();
  });

  it('falls back to initialValue when the snapshot value is null', async () => {
    const path = 'families/1/todos';
    const initial = { fallback: true };
    const { result } = renderHook(() => useRtdb(path, initial));

    await waitForListener(path);

    await act(async () => {
      mocks.emit(path, null);
    });

    expect(result.current.data).toEqual(initial);
  });

  it('captures errors from the RTDB listener', async () => {
    const path = 'families/1/todos';
    const { result } = renderHook(() => useRtdb(path, {}));

    await waitForListener(path);

    const err = new Error('Permission denied');
    await act(async () => {
      mocks.emitError(path, err);
    });

    expect(result.current.error).toBe(err);
    expect(result.current.isLoading).toBe(false);
  });

  it('unsubscribes from RTDB on unmount', async () => {
    const path = 'families/1/todos';
    const { unmount } = renderHook(() => useRtdb(path, {}));

    await waitForListener(path);

    const unsub = mocks.unsubscribers.get(path);
    expect(unsub).toBeDefined();

    unmount();

    expect(unsub).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes old path and subscribes to new path when path changes', async () => {
    const path1 = 'families/1/todos';
    const path2 = 'families/2/todos';

    const { rerender } = renderHook(({ p }: { p: string | null }) => useRtdb(p, {}), {
      initialProps: { p: path1 },
    });

    await waitForListener(path1);

    const unsub1 = mocks.unsubscribers.get(path1);
    expect(unsub1).toBeDefined();

    // Switch to the new path and wait for the new subscription to be set up.
    act(() => {
      rerender({ p: path2 });
    });

    await waitForListener(path2);

    // Old path listener should be torn down.
    expect(unsub1).toHaveBeenCalled();
    // New path listener registered.
    expect(mocks.unsubscribers.has(path2)).toBe(true);
  });

  it('unsubscribes when path changes to null', async () => {
    const path = 'families/1/todos';
    const { rerender } = renderHook(({ p }: { p: string | null }) => useRtdb(p, {}), {
      initialProps: { p: path },
    });

    await waitForListener(path);

    const unsub = mocks.unsubscribers.get(path);

    await act(async () => {
      rerender({ p: null });
    });

    expect(unsub).toHaveBeenCalled();
  });
});
