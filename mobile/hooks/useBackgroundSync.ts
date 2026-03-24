import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { choresApi, todosApi } from '@/lib/api';

export const BACKGROUND_SYNC_TASK = 'flowki-background-sync';

/**
 * Register the background-sync task with expo-task-manager.
 * Must be called at the top level of a module (outside any component)
 * so that the task is defined before Expo tries to execute it.
 *
 * The task fetches todos and chores from the backend so that RTDB
 * observers have fresh data to write when the network is available.
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    await Promise.all([todosApi.list(), choresApi.list()]);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    console.warn('[backgroundSync] Sync task failed:', err);

    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

/**
 * Register the background fetch task.  Safe to call multiple times —
 * subsequent calls are no-ops if the task is already registered.
 *
 * Minimum interval: 15 minutes (iOS enforces a platform minimum).
 */
export async function registerBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

    if (!isRegistered) {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60,
        stopOnTerminate: false,
        startOnBoot: true,
      });
    }
  } catch (err) {
    // Background fetch may not be available on all platforms / simulators.
    console.warn('[backgroundSync] Failed to register background task:', err);
  }
}

/**
 * Unregister the background fetch task (e.g. when the user logs out).
 */
export async function unregisterBackgroundSync(): Promise<void> {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_SYNC_TASK);

    if (isRegistered) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
    }
  } catch (err) {
    // Ignore — task may already be unregistered.
    console.warn('[backgroundSync] Failed to unregister background task:', err);
  }
}
