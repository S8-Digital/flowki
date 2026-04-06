/**
 * Tests for mobile/app/(tabs)/calendar.tsx
 *
 * Covers:
 * - Loading state (ActivityIndicator while RTDB loads)
 * - Empty state ("No events on this day" message)
 * - Rendering events from RTDB for the selected day
 * - All-day event display
 * - New event FAB: opens dialog, fills form, submits via calendarApi.create
 * - Validation: shows alert when required fields are empty
 * - Error handling: shows alert when calendarApi.create fails
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { Alert } from 'react-native';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CalendarScreen from '@/app/(tabs)/calendar';
import type { CalendarEvent } from '@/lib/api';

// ── store mock ────────────────────────────────────────────────────────────────

let mockUser: { id: number; family_id: number | null } | null = {
    id: 1,
    family_id: 42,
};

vi.mock('@/store', () => ({
    useAppSelector: vi.fn((selector: (s: { auth: { user: typeof mockUser } }) => unknown) =>
        selector({ auth: { user: mockUser } }),
    ),
}));

// ── react-native Alert mock ───────────────────────────────────────────────────

vi.mock('react-native', async () => {
    const original = await import('../__mocks__/react-native');

    return {
        ...original,
        Alert: {
            alert: vi.fn(),
        },
    };
});

// ── react-native-calendars mock ───────────────────────────────────────────────

vi.mock('react-native-calendars', () => ({
    Calendar: ({
        onDayPress,
        current,
    }: {
        current?: string;
        onDayPress?: (day: { dateString: string }) => void;
        markedDates?: unknown;
        theme?: unknown;
    }) =>
        React.createElement(
            'div',
            { 'data-testid': 'calendar-picker', 'data-current': current },
            React.createElement(
                'button',
                {
                    'data-testid': 'select-date-btn',
                    onClick: () => onDayPress?.({ dateString: '2025-06-20' }),
                },
                'Select 2025-06-20',
            ),
        ),
}));

// ── react-native-paper mock ───────────────────────────────────────────────────

vi.mock('react-native-paper', async () => {
    const React = await import('react');

    const ActivityIndicator = () => React.createElement('div', { 'data-testid': 'activity-indicator' });

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
    }) => React.createElement('button', { onClick: onPress, disabled: disabled || loading }, children);

    const Card = Object.assign(
        ({
            children,
            onLongPress,
        }: {
            children?: React.ReactNode;
            style?: unknown;
            onLongPress?: () => void;
        }) => React.createElement('div', { 'data-testid': 'event-card', onContextMenu: onLongPress }, children),
        {
            Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
        },
    );

    const Dialog = Object.assign(
        ({
            visible,
            children,
        }: {
            visible?: boolean;
            children?: React.ReactNode;
            onDismiss?: () => void;
        }) => (visible ? React.createElement('div', { 'data-testid': 'event-dialog' }, children) : null),
        {
            Title: ({ children }: { children?: React.ReactNode }) => React.createElement('h2', {}, children),
            Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
            Actions: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
        },
    );

    const FAB = ({ onPress }: { onPress?: () => void; icon?: string; style?: unknown; color?: string }) =>
        React.createElement('button', { 'data-testid': 'fab', onClick: onPress }, '+');

    const Portal = ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children ?? null);

    const TextInput = ({
        value,
        onChangeText,
        label,
    }: {
        value?: string;
        onChangeText?: (v: string) => void;
        label?: string;
        mode?: string;
        style?: unknown;
        autoFocus?: boolean;
        placeholder?: string;
    }) =>
        React.createElement('input', {
            'data-testid': `input-${label?.replace(/\s+/g, '-').toLowerCase()}`,
            value: value ?? '',
            placeholder: label,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(e.target.value),
        });

    return { ActivityIndicator, Button, Card, Dialog, FAB, Portal, TextInput };
});

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({
        children,
        style,
        variant,
    }: {
        children?: React.ReactNode;
        style?: unknown;
        variant?: string;
    }) => React.createElement('span', { style, 'data-variant': variant }, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
        React.createElement('div', {}, children ?? null),
}));

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: {
            tint: '#3B82F6',
            card: '#F3F4F6',
            border: '#E5E7EB',
            muted: '#6B7280',
            background: '#FFFFFF',
            text: '#111827',
        },
        dark: {
            tint: '#3B82F6',
            card: '#151718',
            border: '#374151',
            muted: '#9CA3AF',
            background: '#0A0A0A',
            text: '#ECEDEE',
        },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

const { mockCalendarApi } = vi.hoisted(() => ({
    mockCalendarApi: {
        create: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@/lib/api', () => ({
    calendarApi: mockCalendarApi,
}));

let mockRtdbData: Record<string, CalendarEvent> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

const makeEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
    id: 1,
    family_id: 42,
    created_by: 1,
    title: 'Team meeting',
    description: null,
    location: null,
    start_at: `${today}T09:00:00.000Z`,
    end_at: `${today}T10:00:00.000Z`,
    is_all_day: false,
    color: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('CalendarScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRtdbData = {};
        mockRtdbLoading = false;
        mockUser = { id: 1, family_id: 42 };
    });

    it('shows loading indicator while RTDB is loading', () => {
        mockRtdbLoading = true;

        render(<CalendarScreen />);

        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows empty state when there are no events for the selected day', () => {
        render(<CalendarScreen />);

        expect(screen.getByText('No events on this day')).toBeInTheDocument();
    });

    it('renders events for today from RTDB', () => {
        mockRtdbData = { '1': makeEvent({ title: 'Morning standup' }) };

        render(<CalendarScreen />);

        expect(screen.getByText('Morning standup')).toBeInTheDocument();
    });

    it('renders an all-day event label', () => {
        mockRtdbData = { '1': makeEvent({ is_all_day: true }) };

        render(<CalendarScreen />);

        expect(screen.getByText('All day')).toBeInTheDocument();
    });

    it('renders the event description when present', () => {
        mockRtdbData = { '1': makeEvent({ description: 'Sprint planning session' }) };

        render(<CalendarScreen />);

        expect(screen.getByText('Sprint planning session')).toBeInTheDocument();
    });

    it('does not render events from a different day', () => {
        mockRtdbData = { '1': makeEvent({ start_at: '2020-01-01T09:00:00.000Z' }) };

        render(<CalendarScreen />);

        expect(screen.getByText('No events on this day')).toBeInTheDocument();
        expect(screen.queryByText('Team meeting')).toBeNull();
    });

    it('renders the calendar widget', () => {
        render(<CalendarScreen />);

        expect(screen.getByTestId('calendar-picker')).toBeInTheDocument();
    });

    it('changes selected day and renders events for that day', () => {
        mockRtdbData = {
            '1': makeEvent({ title: 'Today only' }),
            '2': makeEvent({ id: 2, title: 'Selected day event', start_at: '2025-06-20T09:00:00.000Z', end_at: '2025-06-20T10:00:00.000Z' }),
        };

        render(<CalendarScreen />);

        expect(screen.getByText('Today only')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('select-date-btn'));

        expect(screen.getByText('Selected day event')).toBeInTheDocument();
        expect(screen.queryByText('Today only')).toBeNull();
    });

    it('opens and closes the create event dialog', () => {
        render(<CalendarScreen />);

        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('event-dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'New Event' })).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByTestId('event-dialog')).toBeNull();
    });

    it('shows an alert when creating an event with empty fields', () => {
        render(<CalendarScreen />);

        fireEvent.click(screen.getByTestId('fab'));
        fireEvent.change(screen.getByTestId('input-title'), { target: { value: '' } });
        fireEvent.change(screen.getByTestId('input-start-(yyyy-mm-dd-hh:mm)'), { target: { value: '' } });
        fireEvent.change(screen.getByTestId('input-end-(yyyy-mm-dd-hh:mm)'), { target: { value: '' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        expect(mockCalendarApi.create).not.toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
    });

    it('calls calendarApi.create with entered details', async () => {
        render(<CalendarScreen />);

        fireEvent.click(screen.getByTestId('fab'));
        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'New meeting' } });
        fireEvent.change(screen.getByTestId('input-start-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${today} 09:00` },
        });
        fireEvent.change(screen.getByTestId('input-end-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${today} 10:00` },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(mockCalendarApi.create).toHaveBeenCalledWith({
                title: 'New meeting',
                start_at: `${today} 09:00`,
                end_at: `${today} 10:00`,
            });
        });
    });

    it('closes the dialog after successful create', async () => {
        render(<CalendarScreen />);

        fireEvent.click(screen.getByTestId('fab'));
        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Created event' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(screen.queryByTestId('event-dialog')).toBeNull();
        });
    });

    it('shows an alert when calendarApi.create fails', async () => {
        mockCalendarApi.create.mockRejectedValueOnce(new Error('Network error'));

        render(<CalendarScreen />);

        fireEvent.click(screen.getByTestId('fab'));
        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Failing event' } });
        fireEvent.change(screen.getByTestId('input-start-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${today} 09:00` },
        });
        fireEvent.change(screen.getByTestId('input-end-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${today} 10:00` },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Create' }));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not create event.');
        });
    });

    it('renders multiple events sorted by start time', () => {
        mockRtdbData = {
            '1': makeEvent({ id: 1, title: 'Later event', start_at: `${today}T11:00:00.000Z` }),
            '2': makeEvent({ id: 2, title: 'Earlier event', start_at: `${today}T08:00:00.000Z` }),
        };

        render(<CalendarScreen />);

        const titles = screen.getAllByText(/event$/i).map((node) => node.textContent);
        expect(titles[0]).toBe('Earlier event');
        expect(titles[1]).toBe('Later event');
    });

    it('renders an event card for each visible event', () => {
        mockRtdbData = {
            '1': makeEvent({ id: 1, title: 'Event A' }),
            '2': makeEvent({ id: 2, title: 'Event B' }),
            '3': makeEvent({ id: 3, title: 'Event C' }),
        };

        render(<CalendarScreen />);

        expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
});
