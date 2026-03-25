/**
 * Tests for mobile/hooks/useAppIntentHandler.ts
 *
 * Verifies that deep links opened by the iOS App Intents are correctly
 * translated into voice-command API calls and that the onResult callback
 * receives the server response.
 */

import * as Linking from 'expo-linking';
import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildVoiceCommand, useAppIntentHandler } from '../hooks/useAppIntentHandler';
import type { IntentType } from '../hooks/useAppIntentHandler';

// ── mocks ────────────────────────────────────────────────────────────────────

const mockSendCommand = vi.fn();

vi.mock('@/lib/api', () => ({
  voiceApi: {
    sendCommand: (...args: unknown[]) => mockSendCommand(...args),
  },
}));

vi.mock('expo-linking', () => ({
  parse: vi.fn(),
  addEventListener: vi.fn(() => ({ remove: vi.fn() })),
}));

// ── buildVoiceCommand ────────────────────────────────────────────────────────

describe('buildVoiceCommand', () => {
  it.each<[IntentType, Record<string, string>, string]>([
    ['create-todo', { title: 'Buy milk' }, 'Create a todo: Buy milk'],
    ['add-shopping-item', { item: 'eggs' }, 'Add eggs to my shopping list'],
    ['get-schedule', {}, "What's on my schedule today?"],
    ['complete-chore', { chore: 'vacuuming' }, 'Mark vacuuming as done'],
    ['add-chore', { chore: 'take out bins' }, 'Add a chore: take out bins'],
    ['add-calendar-item', { event: 'dentist on Friday' }, 'Add a calendar event: dentist on Friday'],
  ])('%s builds the correct command', (type, params, expected) => {
    expect(buildVoiceCommand(type, params)).toBe(expected);
  });

  it('handles missing title gracefully for create-todo', () => {
    expect(buildVoiceCommand('create-todo', {})).toBe('Create a todo: ');
  });

  it('handles missing item gracefully for add-shopping-item', () => {
    expect(buildVoiceCommand('add-shopping-item', {})).toBe('Add  to my shopping list');
  });

  it('handles missing chore gracefully for complete-chore', () => {
    expect(buildVoiceCommand('complete-chore', {})).toBe('Mark  as done');
  });

  it('handles missing chore gracefully for add-chore', () => {
    expect(buildVoiceCommand('add-chore', {})).toBe('Add a chore: ');
  });

  it('handles missing event gracefully for add-calendar-item', () => {
    expect(buildVoiceCommand('add-calendar-item', {})).toBe('Add a calendar event: ');
  });
});

// ── useAppIntentHandler ──────────────────────────────────────────────────────

describe('useAppIntentHandler', () => {
  let capturedListener: ((event: { url: string }) => void) | undefined;
  let mockRemove: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockRemove = vi.fn();

    vi.mocked(Linking.addEventListener).mockImplementation((_event, handler) => {
      capturedListener = handler as (event: { url: string }) => void;
      return { remove: mockRemove };
    });

    vi.mocked(Linking.parse).mockImplementation((url: string) => {
      // Minimal parse: extract query params from the URL.
      const [, qs] = url.split('?');
      const queryParams: Record<string, string> = {};
      if (qs) {
        for (const part of qs.split('&')) {
          const [k, v] = part.split('=');
          if (k) queryParams[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
        }
      }
      return { scheme: 'flowki', hostname: 'intent', path: null, queryParams };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers a Linking url event listener on mount', () => {
    renderHook(() => useAppIntentHandler());
    expect(Linking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
  });

  it('removes the listener on unmount', () => {
    const { unmount } = renderHook(() => useAppIntentHandler());
    unmount();
    expect(mockRemove).toHaveBeenCalled();
  });

  it('ignores URLs that do not start with flowki://intent', async () => {
    renderHook(() => useAppIntentHandler());
    await capturedListener?.({ url: 'flowki://todos' });
    expect(mockSendCommand).not.toHaveBeenCalled();
  });

  it('ignores intent URLs without a type param', async () => {
    renderHook(() => useAppIntentHandler());
    await capturedListener?.({ url: 'flowki://intent?foo=bar' });
    expect(mockSendCommand).not.toHaveBeenCalled();
  });

  it('sends create-todo command and calls onResult on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'To-do created!' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=create-todo&title=Buy%20milk' });

    expect(mockSendCommand).toHaveBeenCalledWith('Create a todo: Buy milk');
    expect(onResult).toHaveBeenCalledWith('To-do created!', false);
  });

  it('sends add-shopping-item command and calls onResult on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Added eggs to your list.' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=add-shopping-item&item=eggs' });

    expect(mockSendCommand).toHaveBeenCalledWith('Add eggs to my shopping list');
    expect(onResult).toHaveBeenCalledWith('Added eggs to your list.', false);
  });

  it('sends get-schedule command without params', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'You have 2 events today.' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=get-schedule' });

    expect(mockSendCommand).toHaveBeenCalledWith("What's on my schedule today?");
    expect(onResult).toHaveBeenCalledWith('You have 2 events today.', false);
  });

  it('sends complete-chore command and calls onResult on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Vacuuming marked as done.' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=complete-chore&chore=vacuuming' });

    expect(mockSendCommand).toHaveBeenCalledWith('Mark vacuuming as done');
    expect(onResult).toHaveBeenCalledWith('Vacuuming marked as done.', false);
  });

  it('sends add-chore command and calls onResult on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Chore added.' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=add-chore&chore=take%20out%20bins' });

    expect(mockSendCommand).toHaveBeenCalledWith('Add a chore: take out bins');
    expect(onResult).toHaveBeenCalledWith('Chore added.', false);
  });

  it('sends add-calendar-item command and calls onResult on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Event added to your calendar.' });
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({
      url: 'flowki://intent?type=add-calendar-item&event=dentist%20on%20Friday',
    });

    expect(mockSendCommand).toHaveBeenCalledWith('Add a calendar event: dentist on Friday');
    expect(onResult).toHaveBeenCalledWith('Event added to your calendar.', false);
  });

  it('calls onResult with error=true when sendCommand throws an Error', async () => {
    mockSendCommand.mockRejectedValue(new Error('Network error'));
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=get-schedule' });

    expect(onResult).toHaveBeenCalledWith('Network error', true);
  });

  it('calls onResult with a fallback message when sendCommand throws non-Error', async () => {
    mockSendCommand.mockRejectedValue('unexpected');
    const onResult = vi.fn();
    renderHook(() => useAppIntentHandler(onResult));

    await capturedListener?.({ url: 'flowki://intent?type=get-schedule' });

    expect(onResult).toHaveBeenCalledWith('Could not process Siri command.', true);
  });

  it('does not call onResult when it is not provided', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Done.' });
    renderHook(() => useAppIntentHandler());
    // Should not throw.
    await capturedListener?.({ url: 'flowki://intent?type=get-schedule' });
    expect(mockSendCommand).toHaveBeenCalled();
  });
});
