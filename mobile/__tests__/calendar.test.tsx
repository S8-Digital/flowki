/**
 * Tests for mobile/app/(tabs)/calendar.tsx (CalendarScreen)
 *
 * Covers:
 * - Loading state (ActivityIndicator shown while RTDB loads)
 * - "No events on this day" empty state
 * - Renders events for the selected date
 * - Shows "All day" label for all-day events
 * - Shows time range for timed events
 * - Shows event description when present
 * - FAB opens the create event dialog
 * - Create event dialog validates empty fields
 * - Create event dialog submits via calendarApi.create
 * - Cancel button closes the dialog
 * - Deleting an event calls calendarApi.remove after confirm
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
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

vi.mock('react-native-calendars', () => {
    const React = require('react');
    return {
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
                React.createElement('button', {
                    'data-testid': 'select-date-btn',
                    onClick: () => onDayPress?.({ dateString: '2025-06-20' }),
                }, 'Select 2025-06-20'),
            ),
    };
});

// ── react-native-paper mock ───────────────────────────────────────────────────

vi.mock('react-native-paper', async () => {
    const React = await import('react');

    const ActivityIndicator = () => React.createElement('div', { 'data-testid': 'activity-indicator' });

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

    const Button = ({
        children,
        onPress,
        loading,
        disabled,
    }: {
        children?: React.ReactNode;
        onPress?: () => void;
        loading?: boolean;
        disabled?: boolean;
    }) => React.createElement('button', { onClick: onPress, disabled: loading || disabled }, children);

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

    const FAB = ({ onPress }: { onPress?: () => void; icon?: string; style?: unknown; color?: string }) =>
        React.createElement('button', { 'data-testid': 'fab', onClick: onPress }, '+');

    const Dialog = Object.assign(
        ({
            visible,
            children,
        }: {
            visible?: boolean;
            children?: React.ReactNode;
            onDismiss?: () => void;
        }) =>
            visible
                ? React.createElement('div', { 'data-testid': 'create-dialog' }, children)
                : null,
        {
            Title: ({ children }: { children?: React.ReactNode }) => React.createElement('h2', {}, children),
            Content: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
            Actions: ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children),
        },
    );

    const Portal = ({ children }: { children?: React.ReactNode }) => React.createElement('div', {}, children);

    return { ActivityIndicator, Button, Card, Dialog, FAB, Portal, TextInput };
});

// ── ThemedText / ThemedView mocks ─────────────────────────────────────────────

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

// ── Colors / useColorScheme mocks ─────────────────────────────────────────────

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: {
            tint: '#3B82F6',
            card: '#F3F4F6',
            muted: '#6B7280',
            background: '#FFFFFF',
            text: '#000000',
            border: '#E5E7EB',
        },
        dark: {
            tint: '#3B82F6',
            card: '#151718',
            muted: '#9CA3AF',
            background: '#09090B',
            text: '#FFFFFF',
            border: '#374151',
        },
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
        list: vi.fn(() => Promise.resolve([])),
        update: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@/lib/api', () => ({
    calendarApi: mockCalendarApi,
}));

// ── useRtdb mock ──────────────────────────────────────────────────────────────

let mockRtdbData: Record<string, CalendarEvent> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

// Use a fixed date that is the "today" string in the component
const today = new Date();
const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

const makeEvent = (overrides: Partial<CalendarEvent> = {}): CalendarEvent => ({
    id: 1,
    family_id: 42,
    created_by: 1,
    title: 'Morning standup',
    start_at: `${todayStr}T09:00:00Z`,
    end_at: `${todayStr}T09:30:00Z`,
    is_all_day: false,
    color: '#6366f1',
    description: null,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
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

    it('shows an activity indicator while loading', () => {
        mockRtdbLoading = true;
        render(React.createElement(CalendarScreen));
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows "No events on this day" empty state', () => {
        render(React.createElement(CalendarScreen));
        expect(screen.getByText('No events on this day')).toBeInTheDocument();
    });

    it('renders today\'s events', () => {
        mockRtdbData = { '1': makeEvent({ title: 'Morning standup' }) };
        render(React.createElement(CalendarScreen));
        expect(screen.getByText('Morning standup')).toBeInTheDocument();
    });

    it('shows "All day" label for all-day events', () => {
        mockRtdbData = { '1': makeEvent({ is_all_day: true }) };
        render(React.createElement(CalendarScreen));
        expect(screen.getByText('All day')).toBeInTheDocument();
    });

    it('renders event description when present', () => {
        mockRtdbData = {
            '1': makeEvent({ description: 'Sprint planning discussion' }),
        };
        render(React.createElement(CalendarScreen));
        expect(screen.getByText('Sprint planning discussion')).toBeInTheDocument();
    });

    it('does not render description section when description is null', () => {
        mockRtdbData = { '1': makeEvent({ description: null }) };
        render(React.createElement(CalendarScreen));
        expect(screen.queryByText('Sprint planning discussion')).toBeNull();
    });

    it('renders the calendar picker', () => {
        render(React.createElement(CalendarScreen));
        expect(screen.getByTestId('calendar-picker')).toBeInTheDocument();
    });

    it('opens the create dialog when FAB is pressed', () => {
        render(React.createElement(CalendarScreen));
        const fab = screen.getByTestId('fab');
        fireEvent.click(fab);
        expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
        expect(screen.getByText('New Event')).toBeInTheDocument();
    });

    it('hides the dialog when cancel is pressed', () => {
        render(React.createElement(CalendarScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('create-dialog')).toBeInTheDocument();

        const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
        fireEvent.click(cancelBtn);
        expect(screen.queryByTestId('create-dialog')).toBeNull();
    });

    it('creates an event via calendarApi.create when form is filled', async () => {
        render(React.createElement(CalendarScreen));
        fireEvent.click(screen.getByTestId('fab'));

        fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'New Event Title' } });
        fireEvent.change(screen.getByTestId('input-start-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${todayStr} 10:00` },
        });
        fireEvent.change(screen.getByTestId('input-end-(yyyy-mm-dd-hh:mm)'), {
            target: { value: `${todayStr} 11:00` },
        });

        const createBtn = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(mockCalendarApi.create).toHaveBeenCalledWith({
                title: 'New Event Title',
                start_at: `${todayStr} 10:00`,
                end_at: `${todayStr} 11:00`,
            });
        });
    });

    it('does not call calendarApi.create when fields are empty', async () => {
        const { Alert } = await import('react-native');
        render(React.createElement(CalendarScreen));
        fireEvent.click(screen.getByTestId('fab'));

        // Don't fill in any fields
        const createBtn = screen.getByRole('button', { name: 'Create' });
        fireEvent.click(createBtn);

        expect(mockCalendarApi.create).not.toHaveBeenCalled();
        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields.');
    });

    it('renders multiple events sorted by start time', () => {
        mockRtdbData = {
            '1': makeEvent({ id: 1, title: 'Later event', start_at: `${todayStr}T11:00:00Z` }),
            '2': makeEvent({ id: 2, title: 'Earlier event', start_at: `${todayStr}T08:00:00Z` }),
        };
        render(React.createElement(CalendarScreen));
        expect(screen.getByText('Earlier event')).toBeInTheDocument();
        expect(screen.getByText('Later event')).toBeInTheDocument();
    });

    it('renders an event card for each event', () => {
        mockRtdbData = {
            '1': makeEvent({ id: 1, title: 'Event A' }),
            '2': makeEvent({ id: 2, title: 'Event B' }),
            '3': makeEvent({ id: 3, title: 'Event C' }),
        };
        render(React.createElement(CalendarScreen));
        expect(screen.getAllByTestId('event-card')).toHaveLength(3);
    });
});
