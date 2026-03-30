import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import NotificationsScreen from '@/app/(tabs)/notifications';
import type { AppNotification } from '@/lib/api';

vi.mock('react-native-paper', async () => {
  const React = await import('react');

  const Button = ({
    children,
    onPress,
    disabled,
    loading,
  }: {
    children?: React.ReactNode;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    compact?: boolean;
    mode?: string;
    textColor?: string;
  }) =>
    React.createElement(
      'button',
      { onClick: onPress, disabled: disabled || loading },
      children,
    );

  const ActivityIndicator = () =>
    React.createElement('div', { 'data-testid': 'activity-indicator' });

  const Card = Object.assign(
    ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
      React.createElement('div', { 'data-testid': 'notification-card', style }, children),
    {
      Content: ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
        React.createElement('div', { style }, children),
    },
  );

  return { ActivityIndicator, Button, Card };
});

vi.mock('@/components/ThemedText', () => ({
  ThemedText: ({
    children,
    style,
  }: {
    children?: React.ReactNode;
    style?: unknown;
    variant?: string;
  }) => React.createElement('span', { style }, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
  ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
    React.createElement('div', {}, children ?? null),
}));

vi.mock('@/constants/Colors', () => ({
  Colors: {
    light: { tint: '#3B82F6', card: '#F3F4F6', muted: '#6B7280', destructive: '#EF4444' },
    dark: { tint: '#3B82F6', card: '#151718', muted: '#9CA3AF', destructive: '#EF4444' },
  },
}));

vi.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: () => 'light',
}));

const { mockNotificationsApi } = vi.hoisted(() => ({
  mockNotificationsApi: {
    list: vi.fn(),
    markRead: vi.fn(() => Promise.resolve({ message: 'ok', notification: null })),
    markAllRead: vi.fn(() => Promise.resolve({ message: 'ok', unread_count: 0 })),
    remove: vi.fn(() => Promise.resolve()),
  },
}));

vi.mock('@/lib/api', () => ({
  notificationsApi: mockNotificationsApi,
}));

const makeNotification = (overrides: Partial<AppNotification> = {}): AppNotification => ({
  id: 'abc-123',
  type: 'App\\Notifications\\TodoAssigned',
  data: {
    type: 'todo_assigned',
    todo_id: 1,
    todo_title: 'Buy milk',
  },
  read_at: null,
  created_at: '2025-01-01T12:00:00.000Z',
  ...overrides,
});

describe('Notifications screen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [],
      unread_count: 0,
    });
  });

  it('shows a loading indicator before notifications load', () => {
    mockNotificationsApi.list.mockImplementation(() => new Promise(() => {}));
    render(React.createElement(NotificationsScreen));
    expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
  });

  it('shows the empty state when there are no notifications', async () => {
    render(React.createElement(NotificationsScreen));
    await waitFor(() =>
      expect(screen.getByText(/you have no notifications/i)).toBeInTheDocument(),
    );
  });

  it('renders notifications returned by the API', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification(), makeNotification({ id: 'def-456', data: { type: 'chore_assigned', chore_title: 'Vacuum' } })],
      unread_count: 2,
    });

    render(React.createElement(NotificationsScreen));

    await waitFor(() => expect(screen.getByText(/Buy milk/i)).toBeInTheDocument());
    expect(screen.getByText(/Vacuum/i)).toBeInTheDocument();
  });

  it('shows the mark all read button when there are unread notifications', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification()],
      unread_count: 1,
    });

    render(React.createElement(NotificationsScreen));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /mark all read/i })).toBeInTheDocument(),
    );
  });

  it('hides the mark all read button when all notifications are read', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification({ read_at: '2025-01-01T12:05:00.000Z' })],
      unread_count: 0,
    });

    render(React.createElement(NotificationsScreen));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /mark all read/i })).not.toBeInTheDocument(),
    );
  });

  it('calls notificationsApi.markRead when the Read button is pressed', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification()],
      unread_count: 1,
    });

    render(React.createElement(NotificationsScreen));

    const button = (await screen.findAllByRole('button', { name: /read/i })).find(
      (element) => element.textContent === 'Read',
    );
    expect(button).toBeDefined();
    fireEvent.click(button!);

    await waitFor(() =>
      expect(mockNotificationsApi.markRead).toHaveBeenCalledWith('abc-123'),
    );
  });

  it('calls notificationsApi.markAllRead when the top action is pressed', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification(), makeNotification({ id: 'def-456' })],
      unread_count: 2,
    });

    render(React.createElement(NotificationsScreen));

    const button = await screen.findByRole('button', { name: /mark all read/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(mockNotificationsApi.markAllRead).toHaveBeenCalledTimes(1),
    );
  });

  it('calls notificationsApi.remove when Delete is pressed', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [makeNotification()],
      unread_count: 1,
    });

    render(React.createElement(NotificationsScreen));

    const button = await screen.findByRole('button', { name: /delete/i });
    fireEvent.click(button);

    await waitFor(() =>
      expect(mockNotificationsApi.remove).toHaveBeenCalledWith('abc-123'),
    );
  });

  it('falls back to a generic message for unknown notification types', async () => {
    mockNotificationsApi.list.mockResolvedValue({
      notifications: [
        makeNotification({
          data: { type: 'unknown_type' },
        }),
      ],
      unread_count: 1,
    });

    render(React.createElement(NotificationsScreen));

    await waitFor(() =>
      expect(screen.getByText(/you have a new notification/i)).toBeInTheDocument(),
    );
  });
});
