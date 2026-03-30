/**
 * useAppIntentHandler
 *
 * Listens for deep links opened by the iOS App Intents (Siri) or Android App
 * Actions (Google Assistant) and dispatches the corresponding natural-language
 * command to the `/api/mobile/voice/command` endpoint.
 *
 * Deep-link format (opened by the Swift intent / Android shortcut capability):
 *
 *   flowki://intent?type=<intentType>&<params...>
 *
 * Intent types and their parameters:
 *   - `create-todo`        → `title` (string)
 *   - `add-shopping-item`  → `item` (string)
 *   - `get-schedule`       → (no params)
 *   - `complete-chore`     → `chore` (string)
 *   - `add-chore`          → `chore` (string)
 *   - `add-calendar-item`  → `event` (string)
 *
 * Cold-start handling: when the app is launched directly from a Siri/Shortcut
 * or Google Assistant deep link, React Native delivers the URL via
 * `Linking.getInitialURL()` (not the `url` event). This hook handles both paths.
 *
 * This hook is platform-agnostic — it works on both iOS (Siri App Intents) and
 * Android (Google Assistant App Actions) whenever the URL scheme matches
 * `flowki://intent`.
 */

import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { voiceApi } from '@/lib/api';

export type IntentType =
  | 'create-todo'
  | 'add-shopping-item'
  | 'get-schedule'
  | 'complete-chore'
  | 'add-chore'
  | 'add-calendar-item';

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
    case 'add-chore':
      return `Add a chore: ${params.chore ?? ''}`;
    case 'add-calendar-item':
      return `Add a calendar event: ${params.event ?? ''}`;
  }
}

/**
 * Registers a `Linking` event listener that intercepts `flowki://intent?…`
 * URLs and forwards them as voice commands.
 *
 * Also checks `Linking.getInitialURL()` on mount to handle apps that were
 * cold-started by a Siri/Shortcut deep link.
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
        // ApiError (from the api helper) attaches the parsed JSON body as `data`.
        // The backend voice endpoint puts its human-readable message in `data.response`.
        let message = 'Could not process voice command.';
        const apiError = err as { data?: { response?: string } } | undefined;

        if (apiError?.data?.response && typeof apiError.data.response === 'string') {
          message = apiError.data.response;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }

        onResult?.(message, true);
      }
    };

    // Handle cold-start: when the app is launched from a Siri/Shortcut deep
    // link, the initial URL is delivered via getInitialURL(), not the 'url' event.
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    const subscription = Linking.addEventListener('url', handleUrl);

    return () => subscription.remove();
  }, [onResult]);
}
