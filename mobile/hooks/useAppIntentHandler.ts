/**
 * useAppIntentHandler
 *
 * Listens for deep links opened by the iOS App Intents and dispatches the
 * corresponding natural-language command to the `/api/mobile/voice/command`
 * endpoint.
 *
 * Deep-link format (opened by the Swift intent when `openAppWhenRun = true`
 * or when the user taps a result notification):
 *
 *   flowki://intent?type=<intentType>&<params...>
 *
 * Intent types and their parameters:
 *   - `create-todo`        → `title` (string)
 *   - `add-shopping-item`  → `item` (string)
 *   - `get-schedule`       → (no params)
 *   - `complete-chore`     → `chore` (string)
 *
 * This hook is a no-op on Android (intents only exist on iOS) and when the
 * URL scheme does not match `flowki://intent`.
 */

import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { voiceApi } from '@/lib/api';

export type IntentType =
  | 'create-todo'
  | 'add-shopping-item'
  | 'get-schedule'
  | 'complete-chore';

type IntentParams = Record<string, string>;

/**
 * Build the natural-language command that the FamilyAssistantAgent understands
 * from the structured intent type and parameters passed via the deep link.
 */
export function buildVoiceCommand(type: IntentType, params: IntentParams): string {
  switch (type) {
    case 'create-todo':
      return `Create a todo: ${params.title ?? ''}`;
    case 'add-shopping-item':
      return `Add ${params.item ?? ''} to my shopping list`;
    case 'get-schedule':
      return "What's on my schedule today?";
    case 'complete-chore':
      return `Mark ${params.chore ?? ''} as done`;
  }
}

/**
 * Registers a `Linking` event listener that intercepts `flowki://intent?…`
 * URLs and forwards them as voice commands.
 *
 * @param onResult - Optional callback called with the API response text and
 *                   an `isError` flag so the caller can show a toast or banner.
 */
export function useAppIntentHandler(
  onResult?: (response: string, isError: boolean) => void,
): void {
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }): Promise<void> => {
      if (!url.startsWith('flowki://intent')) {
        return;
      }

      const parsed = Linking.parse(url);
      const type = parsed.queryParams?.type as IntentType | undefined;

      if (!type) {
        return;
      }

      // Collect string query params (Linking may return string | string[]).
      const params: IntentParams = {};
      for (const [k, v] of Object.entries(parsed.queryParams ?? {})) {
        if (typeof v === 'string') {
          params[k] = v;
        } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') {
          params[k] = v[0];
        }
      }

      const command = buildVoiceCommand(type, params);

      try {
        const res = await voiceApi.sendCommand(command);
        if (res.success) {
          onResult?.(res.response, false);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Could not process Siri command.';
        onResult?.(message, true);
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, [onResult]);
}
