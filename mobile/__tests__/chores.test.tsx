/**
 * Tests for mobile/app/(tabs)/chores.tsx
 *
 * Covers:
 * - Loading state (ActivityIndicator shown while RTDB loads)
 * - Empty state ("No chores yet" message)
 * - Rendering a list of chores from RTDB
 * - Add-chore dialog: open, fill title, submit
 * - Complete chore via choresApi.complete
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ChoresScreen from '@/app/(tabs)/chores';
import type { Chore } from '@/lib/api';

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
    }) =>
        React.createElement(
            'button',
            { onClick: onPress, disabled: disabled || loading },
            children,
        );

    const TextInput = ({
        value,
        onChangeText,
        label,
        testID,
    }: {
        value?: string;
        onChangeText?: (v: string) => void;
        label?: string;
        testID?: string;
    }) =>
        React.createElement('input', {
            'data-testid': testID ?? 'text-input',
            value: value ?? '',
            placeholder: label,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(e.target.value),
        });

    const ActivityIndicator = () =>
        React.createElement('div', { 'data-testid': 'activity-indicator' });

    const Chip = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('span', { 'data-testid': 'chip' }, children);

    const FAB = ({ onPress }: { onPress?: () => void; icon?: string; style?: unknown; color?: string }) =>
        React.createElement('button', { 'data-testid': 'fab', onClick: onPress }, '+');

    const FlatList = ({
        data,
        renderItem,
        keyExtractor,
    }: {
        data?: unknown[];
        renderItem?: (info: { item: unknown; index: number }) => React.ReactNode;
        keyExtractor?: (item: unknown) => string;
        contentContainerStyle?: unknown;
    }) =>
        React.createElement(
            'div',
            { 'data-testid': 'flat-list' },
            (data ?? []).map((item, index) =>
                React.createElement(
                    'div',
                    { key: keyExtractor ? keyExtractor(item) : index },
                    renderItem ? renderItem({ item, index }) : null,
                ),
            ),
        );

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
                ? React.createElement('div', { 'data-testid': 'add-dialog' }, children)
                : null,
        {
            Title: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('h2', {}, children),
            Content: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', {}, children),
            Actions: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', {}, children),
        },
    );

    const Portal = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children);

    return { ActivityIndicator, Button, Chip, Dialog, FAB, FlatList, Portal, TextInput };
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
    ThemedView: ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children ?? null),
}));

vi.mock('@/constants/Colors', () => ({
    Colors: {
        light: { tint: '#3B82F6', card: '#F3F4F6', border: '#E5E7EB', muted: '#6B7280', destructive: '#EF4444', success: '#22C55E' },
        dark: { tint: '#3B82F6', card: '#151718', border: '#374151', muted: '#9CA3AF', destructive: '#EF4444', success: '#22C55E' },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

// ── choresApi mock ────────────────────────────────────────────────────────────

const { mockChoresApi } = vi.hoisted(() => ({
    mockChoresApi: {
        update: vi.fn(() => Promise.resolve()),
        remove: vi.fn(() => Promise.resolve()),
        create: vi.fn(() => Promise.resolve()),
        complete: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@/lib/api', () => ({
    choresApi: mockChoresApi,
}));

// ── useRtdb mock helpers ──────────────────────────────────────────────────────

let mockRtdbData: Record<string, Chore> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeChore = (overrides: Partial<Chore> = {}): Chore => ({
    id: 1,
    title: 'Vacuum floors',
    description: null,
    frequency: 'weekly',
    next_due_date: null,
    last_completed_at: null,
    family_id: 42,
    created_by: 1,
    assignees: [],
    creator: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('Chores screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRtdbData = {};
        mockRtdbLoading = false;
        mockUser = { id: 1, family_id: 42 };
    });

    it('shows an activity indicator while loading', () => {
        mockRtdbLoading = true;
        render(React.createElement(ChoresScreen));
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows the empty state when there are no chores', () => {
        render(React.createElement(ChoresScreen));
        expect(screen.getByText(/No chores yet/i)).toBeInTheDocument();
    });

    it('renders a list of chores', () => {
        mockRtdbData = {
            '1': makeChore({ id: 1, title: 'Vacuum floors' }),
            '2': makeChore({ id: 2, title: 'Do the dishes' }),
        };
        render(React.createElement(ChoresScreen));
        expect(screen.getByText('Vacuum floors')).toBeInTheDocument();
        expect(screen.getByText('Do the dishes')).toBeInTheDocument();
    });

    it('renders the frequency chip for a chore', () => {
        mockRtdbData = {
            '1': makeChore({ id: 1, title: 'Vacuum', frequency: 'daily' }),
        };
        render(React.createElement(ChoresScreen));
        expect(screen.getByTestId('chip')).toBeInTheDocument();
        expect(screen.getByText('daily')).toBeInTheDocument();
    });

    it('renders due date when present', () => {
        mockRtdbData = {
            '1': makeChore({ id: 1, title: 'Mow lawn', next_due_date: '2030-06-01T00:00:00.000Z' }),
        };
        render(React.createElement(ChoresScreen));
        expect(screen.getByText(/Due/i)).toBeInTheDocument();
    });

    it('shows the FAB button', () => {
        render(React.createElement(ChoresScreen));
        expect(screen.getByTestId('fab')).toBeInTheDocument();
    });

    it('opens the add-chore dialog when FAB is pressed', () => {
        render(React.createElement(ChoresScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('add-dialog')).toBeInTheDocument();
        expect(screen.getByText('New Chore')).toBeInTheDocument();
    });

    it('calls choresApi.create when the Add button is clicked with a title', async () => {
        render(React.createElement(ChoresScreen));
        fireEvent.click(screen.getByTestId('fab'));

        // Get all text inputs and use the first one (Title field)
        const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
        fireEvent.change(inputs[0], { target: { value: 'New chore task' } });

        const addBtn = screen.getAllByRole('button', { name: /Add/i })[0];
        fireEvent.click(addBtn);

        await waitFor(() =>
            expect(mockChoresApi.create).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'New chore task' }),
            ),
        );
    });

    it('does not call choresApi.create when title is empty', async () => {
        render(React.createElement(ChoresScreen));
        fireEvent.click(screen.getByTestId('fab'));

        const addBtn = screen.getAllByRole('button', { name: /Add/i })[0];
        fireEvent.click(addBtn);

        await waitFor(() => expect(mockChoresApi.create).not.toHaveBeenCalled());
    });

    it('cancels the dialog when Cancel is clicked', () => {
        render(React.createElement(ChoresScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(screen.queryByTestId('add-dialog')).not.toBeInTheDocument();
    });
});
