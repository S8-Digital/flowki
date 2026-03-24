import { getFirebaseDatabase } from '@/lib/firebase';
import { renderHook, act } from '@testing-library/react-native';
import { afterEach, beforeEach, describe, expect, it,  vi } from 'vitest';
import type {Mock} from 'vitest';
import { useRtdb } from '@/hooks/useRtdb';

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Flush all pending promises/microtasks so async setup inside hooks completes.
 * Multiple rounds are needed because the hook chains several async operations
 * (dynamic import + getFirebaseDatabase + onValue setup).
 */
const flushPromises = async () => {
  for (let i = 0; i < 5; i++) {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
};

/** Create a minimal Firebase onValue / ref mock pair. */
function makeFirebaseMocks() {
  const listeners = new Map<string, (snapshot: unknown) => void>();
  const errorListeners = new Map<string, (err: Error) => void>();
  const unsubscribers = new Map<string, Mock>();

  const onValue = vi.fn(
    (dbRef: { path: string }, success: (s: unknown) => void, error: (e: Error) => void) => {
      listeners.set(dbRef.path, success);
      errorListeners.set(dbRef.path, error);
      const unsub = vi.fn();
      unsubscribers.set(dbRef.path, unsub);

      return unsub;
    },
  );

  const ref = vi.fn((db: unknown, path: string) => ({ path }));

  /** Emit a snapshot value for a path. */
  const emit = (path: string, value: unknown) => {
    const listener = listeners.get(path);

    if (!listener) {
throw new Error(`No listener registered for path: ${path}`);
}

    listener({ val: () => value });
  };

  /** Emit an error for a path. */
  const emitError = (path: string, err: Error) => {
    const listener = errorListeners.get(path);

    if (!listener) {
throw new Error(`No error listener registered for path: ${path}`);
}

    listener(err);
  };

  return { onValue, ref, emit, emitError, unsubscribers };
}

// ── mock setup ──────────────────────────────────────────────────────────────

let mocks = makeFirebaseMocks();

vi.mock('../lib/firebase', () => ({
  getFirebaseDatabase: vi.fn(),
}));

vi.mock('firebase/database', () => ({
  ref: (...args: any[]) => mocks.ref(...args),
  onValue: (...args: any[]) => mocks.onValue(...args),
}));

beforeEach(() => {
  mocks = makeFirebaseMocks();
  vi.mocked(getFirebaseDatabase).mockResolvedValue({} as never);
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

    // Wait for the async Firebase setup
    await act(async () => {
      await flushPromises();
    });

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

    await act(async () => {
      await flushPromises();
      mocks.emit(path, null);
    });

    expect(result.current.data).toEqual(initial);
  });

  it('captures errors from the RTDB listener', async () => {
    const path = 'families/1/todos';
    const { result } = renderHook(() => useRtdb(path, {}));

    await act(async () => {
      await flushPromises();
    });

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

    await act(async () => {
      await flushPromises();
    });

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

    await act(async () => {
      await flushPromises();
    });

    const unsub1 = mocks.unsubscribers.get(path1);
    expect(unsub1).toBeDefined();

    // Rerender with the new path and then flush to allow the new async
    // subscription to be established.
    act(() => {
      rerender({ p: path2 });
    });

    await act(async () => {
      await flushPromises();
    });

    // Old path listener should be torn down
    expect(unsub1).toHaveBeenCalled();
    // New path listener registered
    expect(mocks.unsubscribers.has(path2)).toBe(true);
  });

  it('unsubscribes when path changes to null', async () => {
    const path = 'families/1/todos';
    const { rerender } = renderHook(({ p }: { p: string | null }) => useRtdb(p, {}), {
      initialProps: { p: path },
    });

    await act(async () => {
      await flushPromises();
    });

    const unsub = mocks.unsubscribers.get(path);

    await act(async () => {
      rerender({ p: null });
    });

    expect(unsub).toHaveBeenCalled();
  });
});
