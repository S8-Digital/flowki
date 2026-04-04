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

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

// ── react-native-paper mock ───────────────────────────────────────────────────

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
        mode?: string;
    }) =>
        React.createElement('button', { onClick: onPress, disabled: disabled || loading }, children);

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
            value: value ?? '',
            placeholder: label,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(e.target.value),
        });

    const ActivityIndicator = () =>
        React.createElement('div', { 'data-testid': 'activity-indicator' });

    const FAB = ({ onPress }: { onPress?: () => void; icon?: string; style?: unknown; color?: string }) =>
        React.createElement('button', { 'data-testid': 'fab', onClick: onPress }, '+');

    const Portal = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children ?? null);

    const Dialog = Object.assign(
        ({ visible, children }: { visible?: boolean; children?: React.ReactNode; onDismiss?: () => void }) =>
            visible ? React.createElement('div', { 'data-testid': 'event-dialog' }, children) : null,
        {
            Title: ({ children }: { children?: React.ReactNode }) => React.createElement('h2', {}, children),
            Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
            Actions: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
        },
    );

    const Card = Object.assign(
        ({
            children,
            onLongPress,
        }: {
            children?: React.ReactNode;
            style?: unknown;
            onLongPress?: () => void;
        }) =>
            React.createElement(
                'div',
                { 'data-testid': 'event-card', onContextMenu: onLongPress },
                children,
            ),
        {
            Content: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', {}, children),
        },
    );

    return { ActivityIndicator, Button, Card, Dialog, FAB, Portal, TextInput };
});

// ── react-native-calendars mock ───────────────────────────────────────────────

vi.mock('react-native-calendars', () => ({
    Calendar: ({
        onDayPress,
    }: {
        current?: string;
        onDayPress?: (day: { dateString: string }) => void;
        markedDates?: unknown;
        theme?: unknown;
    }) =>
        React.createElement(
            'div',
            { 'data-testid': 'calendar-widget' },
            React.createElement(
                'button',
                {
                    'data-testid': 'select-day',
                    onClick: () => onDayPress?.({ dateString: '2025-06-15' }),
                },
                'Select day',
            ),
        ),
}));

// ── ThemedText / ThemedView mocks ─────────────────────────────────────────────

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({
        children,
    }: {
        children?: React.ReactNode;
        variant?: string;
        style?: unknown;
    }) => React.createElement('span', {}, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children?: React.ReactNode; style?: unknown }) =>
        React.createElement('div', {}, children ?? null),
}));

// ── Colors / useColorScheme mocks ─────────────────────────────────────────────

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: { tint: '#3B82F6', card: '#F3F4F6', border: '#E5E7EB', muted: '#6B7280', background: '#FFFFFF', text: '#111827' },
        dark: { tint: '#3B82F6', card: '#151718', border: '#374151', muted: '#9CA3AF', background: '#0a0a0a', text: '#ECEDEE' },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

// ── calendarApi mock ──────────────────────────────────────────────────────────

const { mockCalendarApi } = vi.hoisted(() => ({
    mockCalendarApi: {
        create: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@/lib/api', () => ({
    calendarApi: mockCalendarApi,
}));

// ── useRtdb mock helpers ──────────────────────────────────────────────────────

let mockRtdbData: Record<string, CalendarEvent> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

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
        mockRtdbData = {};
        mockRtdbLoading = false;
        mockCalendarApi.create.mockReset();
        mockCalendarApi.remove.mockReset();
        vi.mocked(Alert.alert).mockClear();
    });

    it('shows loading indicator while RTDB is loading', () => {
        mockRtdbLoading = true;
        render(<CalendarScreen />);
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows empty state when there are no events for the day', () => {
        render(<CalendarScreen />);
        expect(screen.getByText(/no events on this day/i)).toBeInTheDocument();
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
        mockRtdbData = {
            '1': makeEvent({ description: 'Sprint planning session' }),
        };
        render(<CalendarScreen />);
        expect(screen.getByText('Sprint planning session')).toBeInTheDocument();
    });

    it('does not render events from a different day', () => {
        mockRtdbData = {
            '1': makeEvent({ start_at: '2020-01-01T09:00:00.000Z' }),
        };
        render(<CalendarScreen />);
        expect(screen.getByText(/no events on this day/i)).toBeInTheDocument();
        expect(screen.queryByText('Team meeting')).toBeNull();
    });

    it('renders the calendar widget', () => {
        render(<CalendarScreen />);
        expect(screen.getByTestId('calendar-widget')).toBeInTheDocument();
    });

    it('opens the create event dialog when FAB is clicked', () => {
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('event-dialog')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: /new event/i })).toBeInTheDocument();
    });

    it('closes the dialog when Cancel is clicked', () => {
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('event-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
        expect(screen.queryByTestId('event-dialog')).toBeNull();
    });

    it('shows an alert when creating an event with empty fields', async () => {
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));

        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
        expect(mockCalendarApi.create).not.toHaveBeenCalled();
    });

    it('calls calendarApi.create with the entered details', async () => {
        mockCalendarApi.create.mockResolvedValueOnce({} as CalendarEvent);
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));

        const [titleInput, startInput, endInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
        fireEvent.change(titleInput, { target: { value: 'New meeting' } });
        fireEvent.change(startInput, { target: { value: `${today} 09:00` } });
        fireEvent.change(endInput, { target: { value: `${today} 10:00` } });

        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(mockCalendarApi.create).toHaveBeenCalledWith({
                title: 'New meeting',
                start_at: `${today} 09:00`,
                end_at: `${today} 10:00`,
            });
        });
    });

    it('closes the dialog after a successful create', async () => {
        mockCalendarApi.create.mockResolvedValueOnce({} as CalendarEvent);
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));

        const [titleInput, startInput, endInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
        fireEvent.change(titleInput, { target: { value: 'New event' } });
        fireEvent.change(startInput, { target: { value: `${today} 09:00` } });
        fireEvent.change(endInput, { target: { value: `${today} 10:00` } });

        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(screen.queryByTestId('event-dialog')).toBeNull();
        });
    });

    it('shows an alert when calendarApi.create fails', async () => {
        mockCalendarApi.create.mockRejectedValueOnce(new Error('Network error'));
        render(<CalendarScreen />);
        fireEvent.click(screen.getByTestId('fab'));

        const [titleInput, startInput, endInput] = screen.getAllByRole('textbox') as HTMLInputElement[];
        fireEvent.change(titleInput, { target: { value: 'Failing event' } });
        fireEvent.change(startInput, { target: { value: `${today} 09:00` } });
        fireEvent.change(endInput, { target: { value: `${today} 10:00` } });

        fireEvent.click(screen.getByRole('button', { name: /create/i }));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Error', 'Could not create event.');
        });
    });
});
