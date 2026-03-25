/**
 * Tests for mobile/components/VoiceCommandBar.tsx
 *
 * Verifies the voice command bar renders correctly and calls the voiceApi
 * with the typed command, then displays the response.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VoiceCommandBar } from '@/components/VoiceCommandBar';

// ── mocks ────────────────────────────────────────────────────────────────────

vi.mock('react-native-paper', async () => {
  const React = await import('react');

  const TextInput = ({
    value,
    onChangeText,
    onSubmitEditing,
    testID,
    placeholder,
  }: {
    value?: string;
    onChangeText?: (v: string) => void;
    onSubmitEditing?: () => void;
    testID?: string;
    placeholder?: string;
  }) =>
    React.createElement('input', {
      'data-testid': testID,
      value: value ?? '',
      placeholder,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(e.target.value),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
          onSubmitEditing?.();
        }
      },
    });

  const Button = ({
    children,
    onPress,
    disabled,
    testID,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    testID?: string;
  }) =>
    React.createElement(
      'button',
      { onClick: onPress, disabled, 'data-testid': testID },
      children,
    );

  const Card = Object.assign(
    ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', {}, children),
    {
      Content: ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children),
    },
  );

  const ActivityIndicator = () => React.createElement('div', { 'data-testid': 'activity-indicator' });

  return { TextInput, Button, Card, ActivityIndicator };
});

vi.mock('@/components/ThemedText', () => ({
  ThemedText: ({ children, testID }: { children?: React.ReactNode; testID?: string }) =>
    React.createElement('span', { 'data-testid': testID }, children),
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    light: { card: '#fff', tint: '#3B82F6', destructive: '#EF4444', text: '#11181C' },
    dark: { card: '#1F2937', tint: '#3B82F6', destructive: '#F87171', text: '#ECEDEE' },
  },
}));

vi.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const mockSendCommand = vi.fn();

vi.mock('@/lib/api', () => ({
  voiceApi: {
    sendCommand: (...args: unknown[]) => mockSendCommand(...args),
  },
}));

// ── tests ────────────────────────────────────────────────────────────────────

describe('VoiceCommandBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the text input and send button', () => {
    render(React.createElement(VoiceCommandBar));
    expect(screen.getByTestId('voice-command-input')).toBeInTheDocument();
    expect(screen.getByTestId('voice-command-send')).toBeInTheDocument();
  });

  it('send button is disabled when input is empty', () => {
    render(React.createElement(VoiceCommandBar));
    const btn = screen.getByTestId('voice-command-send') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('send button is enabled after typing a command', () => {
    render(React.createElement(VoiceCommandBar));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add milk' } });
    const btn = screen.getByTestId('voice-command-send') as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it('calls voiceApi.sendCommand and shows the response on success', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Added milk to your shopping list.' });

    render(React.createElement(VoiceCommandBar));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add milk' } });
    fireEvent.click(screen.getByTestId('voice-command-send'));

    await waitFor(() =>
      expect(screen.getByTestId('voice-command-result')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('voice-command-result').textContent).toBe(
      'Added milk to your shopping list.',
    );
    expect(mockSendCommand).toHaveBeenCalledWith('Add milk');
  });

  it('shows the server-provided error message from an ApiError', async () => {
    // The real api helper throws ApiError for non-2xx responses (e.g. 503 when the AI
    // provider is not configured). The backend puts its human-readable text in `data.response`.
    const err = Object.assign(new Error('Service Unavailable'), {
      name: 'ApiError',
      status: 503,
      data: { success: false, response: 'AI is not configured.' },
    });
    mockSendCommand.mockRejectedValue(err);

    render(React.createElement(VoiceCommandBar));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add milk' } });
    fireEvent.click(screen.getByTestId('voice-command-send'));

    await waitFor(() =>
      expect(screen.getByTestId('voice-command-result')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('voice-command-result').textContent).toBe('AI is not configured.');
  });

  it('shows the error message when the API throws without a response payload', async () => {
    mockSendCommand.mockRejectedValue(new Error('Network error'));

    render(React.createElement(VoiceCommandBar));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add milk' } });
    fireEvent.click(screen.getByTestId('voice-command-send'));

    await waitFor(() =>
      expect(screen.getByTestId('voice-command-result')).toBeInTheDocument(),
    );
    expect(screen.getByTestId('voice-command-result').textContent).toBe('Network error');
  });

  it('calls onSuccess callback with the response text', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Todo created.' });
    const onSuccess = vi.fn();

    render(React.createElement(VoiceCommandBar, { onSuccess }));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add a todo' } });
    fireEvent.click(screen.getByTestId('voice-command-send'));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith('Todo created.'));
  });

  it('clears the input after a successful command', async () => {
    mockSendCommand.mockResolvedValue({ success: true, response: 'Done.' });

    render(React.createElement(VoiceCommandBar));
    const input = screen.getByTestId('voice-command-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Add milk' } });
    fireEvent.click(screen.getByTestId('voice-command-send'));

    await waitFor(() => expect(input.value).toBe(''));
  });
});
