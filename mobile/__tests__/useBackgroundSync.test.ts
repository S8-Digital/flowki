import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BACKGROUND_SYNC_TASK,
  registerBackgroundSync,
  unregisterBackgroundSync,
} from '../hooks/useBackgroundSync';

// ── mock api ─────────────────────────────────────────────────────────────────

vi.mock('@/lib/api', () => ({
  todosApi: { list: vi.fn(() => Promise.resolve([])) },
  choresApi: { list: vi.fn(() => Promise.resolve([])) },
}));

// ── tests ────────────────────────────────────────────────────────────────────

describe('useBackgroundSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerBackgroundSync', () => {
    it('registers the task when it is not already registered', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockResolvedValueOnce(false);

      await registerBackgroundSync();

      expect(BackgroundFetch.registerTaskAsync).toHaveBeenCalledWith(
        BACKGROUND_SYNC_TASK,
        expect.objectContaining({
          minimumInterval: 15 * 60,
          stopOnTerminate: false,
          startOnBoot: true,
        }),
      );
    });

    it('does not register the task if it is already registered', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockResolvedValueOnce(true);

      await registerBackgroundSync();

      expect(BackgroundFetch.registerTaskAsync).not.toHaveBeenCalled();
    });

    it('swallows errors if background fetch is unavailable', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockRejectedValueOnce(
        new Error('Not supported'),
      );

      await expect(registerBackgroundSync()).resolves.toBeUndefined();
    });
  });

  describe('unregisterBackgroundSync', () => {
    it('unregisters the task when it is registered', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockResolvedValueOnce(true);

      await unregisterBackgroundSync();

      expect(BackgroundFetch.unregisterTaskAsync).toHaveBeenCalledWith(BACKGROUND_SYNC_TASK);
    });

    it('does not call unregister if the task is not registered', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockResolvedValueOnce(false);

      await unregisterBackgroundSync();

      expect(BackgroundFetch.unregisterTaskAsync).not.toHaveBeenCalled();
    });

    it('swallows errors gracefully', async () => {
      vi.mocked(TaskManager.isTaskRegisteredAsync).mockRejectedValueOnce(
        new Error('Not supported'),
      );

      await expect(unregisterBackgroundSync()).resolves.toBeUndefined();
    });
  });

  it('defines the background task constant', () => {
    expect(BACKGROUND_SYNC_TASK).toBe('flowki-background-sync');
  });
});
