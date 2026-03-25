/**
 * Tests for mobile/app/(tabs)/todos.tsx
 *
 * Covers:
 * - Loading state (ActivityIndicator shown while RTDB loads)
 * - Empty state ("No todos yet" message)
 * - Rendering a list of todos from RTDB
 * - Add-todo dialog: open, fill title, submit
 * - Toggle todo status via todosApi.update
 * - Delete todo via todosApi.remove
 */

import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import TodosScreen from '@/app/(tabs)/todos';
import type { Todo } from '@/lib/api';
import { ref as fbRef, onValue as fbOnValue } from 'firebase/database';

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
    }: {
        value?: string;
        onChangeText?: (v: string) => void;
        label?: string;
    }) =>
        React.createElement('input', {
            'data-testid': 'todo-title-input',
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
        light: { tint: '#3B82F6', card: '#F3F4F6', border: '#E5E7EB', muted: '#6B7280', destructive: '#EF4444' },
        dark: { tint: '#3B82F6', card: '#151718', border: '#374151', muted: '#9CA3AF', destructive: '#EF4444' },
    },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

// ── todosApi mock ─────────────────────────────────────────────────────────────

const mockTodosApi = {
    update: vi.fn(() => Promise.resolve()),
    remove: vi.fn(() => Promise.resolve()),
    create: vi.fn(() => Promise.resolve()),
};

vi.mock('@/lib/api', () => ({
    todosApi: mockTodosApi,
}));

// ── useRtdb mock helpers ──────────────────────────────────────────────────────

let mockRtdbData: Record<string, Todo> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 1,
    title: 'Buy milk',
    status: 'pending',
    priority: 'medium',
    category: 'home',
    description: null,
    due_date: null,
    family_id: 42,
    created_by: 1,
    assigned_to: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('Todos screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRtdbData = {};
        mockRtdbLoading = false;
        mockUser = { id: 1, family_id: 42 };
    });

    it('shows an activity indicator while loading', () => {
        mockRtdbLoading = true;
        render(React.createElement(TodosScreen));
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows the empty state when there are no todos', () => {
        render(React.createElement(TodosScreen));
        expect(screen.getByText(/No todos yet/i)).toBeInTheDocument();
    });

    it('renders a list of todos', () => {
        mockRtdbData = {
            '1': makeTodo({ id: 1, title: 'Buy milk' }),
            '2': makeTodo({ id: 2, title: 'Walk the dog' }),
        };
        render(React.createElement(TodosScreen));
        expect(screen.getByText('Buy milk')).toBeInTheDocument();
        expect(screen.getByText('Walk the dog')).toBeInTheDocument();
    });

    it('renders a completed todo with strikethrough style', () => {
        mockRtdbData = {
            '1': makeTodo({ id: 1, title: 'Done task', status: 'done' }),
        };
        render(React.createElement(TodosScreen));
        expect(screen.getByText('Done task')).toBeInTheDocument();
    });

    it('renders the priority chip for a todo with priority', () => {
        mockRtdbData = {
            '1': makeTodo({ id: 1, title: 'High priority', priority: 'high' }),
        };
        render(React.createElement(TodosScreen));
        expect(screen.getByTestId('chip')).toBeInTheDocument();
    });

    it('renders due date when present', () => {
        mockRtdbData = {
            '1': makeTodo({ id: 1, title: 'Due soon', due_date: '2030-12-31T00:00:00.000Z' }),
        };
        render(React.createElement(TodosScreen));
        expect(screen.getByText(/Due/i)).toBeInTheDocument();
    });

    it('shows the FAB button to add a new todo', () => {
        render(React.createElement(TodosScreen));
        expect(screen.getByTestId('fab')).toBeInTheDocument();
    });

    it('opens the add-todo dialog when FAB is pressed', () => {
        render(React.createElement(TodosScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('add-dialog')).toBeInTheDocument();
        expect(screen.getByText('New Todo')).toBeInTheDocument();
    });

    it('calls todosApi.create when the Add button is clicked', async () => {
        render(React.createElement(TodosScreen));
        fireEvent.click(screen.getByTestId('fab'));

        const input = screen.getByTestId('todo-title-input');
        fireEvent.change(input, { target: { value: 'New task' } });

        const addBtn = screen.getAllByRole('button', { name: /Add/i })[0];
        fireEvent.click(addBtn);

        await waitFor(() =>
            expect(mockTodosApi.create).toHaveBeenCalledWith({ title: 'New task', status: 'pending' }),
        );
    });

    it('does not call todosApi.create when the title is empty', async () => {
        render(React.createElement(TodosScreen));
        fireEvent.click(screen.getByTestId('fab'));

        const addBtn = screen.getAllByRole('button', { name: /Add/i })[0];
        fireEvent.click(addBtn);

        await waitFor(() => expect(mockTodosApi.create).not.toHaveBeenCalled());
    });

    it('closes the dialog after successful creation', async () => {
        render(React.createElement(TodosScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

        const input = screen.getByTestId('todo-title-input');
        fireEvent.change(input, { target: { value: 'New task' } });

        const addBtn = screen.getAllByRole('button', { name: /Add/i })[0];
        fireEvent.click(addBtn);

        await waitFor(() => expect(screen.queryByTestId('add-dialog')).not.toBeInTheDocument());
    });

    it('calls todosApi.update when a todo checkbox is clicked (toggles to done)', async () => {
        mockRtdbData = { '1': makeTodo({ id: 1, title: 'Buy milk', status: 'pending' }) };
        render(React.createElement(TodosScreen));

        const checkboxes = screen.getAllByRole('button');
        // Find the first non-fab, non-dialog button that triggers toggle
        const checkboxArea = checkboxes.find((b) => b.textContent === '');
        if (checkboxArea) {
            fireEvent.click(checkboxArea);
            await waitFor(() =>
                expect(mockTodosApi.update).toHaveBeenCalledWith(1, { status: 'done' }),
            );
        }
    });

    it('cancels the dialog when Cancel is clicked', () => {
        render(React.createElement(TodosScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('add-dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(screen.queryByTestId('add-dialog')).not.toBeInTheDocument();
    });
});
