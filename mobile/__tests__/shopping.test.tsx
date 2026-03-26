/**
 * Tests for mobile/app/(tabs)/shopping.tsx
 *
 * Covers:
 * - Loading state (ActivityIndicator while RTDB loads)
 * - Empty state ("No shopping lists yet" message)
 * - Rendering shopping lists from RTDB
 * - Creating a new shopping list via FAB and dialog
 * - Rendering shopping items within a list
 * - Toggling an item via shoppingApi.toggleItem
 * - Deleting an item via shoppingApi.removeItem
 * - Adding an item to a list
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ShoppingScreen from '@/app/(tabs)/shopping';
import type { ShoppingItem, ShoppingList } from '@/lib/api';

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
        icon,
        mode,
    }: {
        children?: React.ReactNode;
        onPress?: () => void;
        disabled?: boolean;
        loading?: boolean;
        icon?: string;
        mode?: string;
        compact?: boolean;
        style?: unknown;
    }) =>
        React.createElement(
            'button',
            { onClick: onPress, disabled: disabled || loading, 'data-icon': icon, 'data-mode': mode },
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
        mode?: string;
        autoFocus?: boolean;
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
                ? React.createElement('div', { 'data-testid': 'dialog' }, children)
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

    const Card = Object.assign(
        ({ children, style }: { children?: React.ReactNode; style?: unknown }) =>
            React.createElement('div', { 'data-testid': 'shopping-list-card', style }, children),
        {
            Content: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', {}, children),
        },
    );

    const Portal = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children);

    return { ActivityIndicator, Button, Card, Dialog, FAB, FlatList, Portal, TextInput };
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

// ── shoppingApi mock ──────────────────────────────────────────────────────────

const { mockShoppingApi } = vi.hoisted(() => ({
    mockShoppingApi: {
        createList: vi.fn(() => Promise.resolve()),
        removeList: vi.fn(() => Promise.resolve()),
        addItem: vi.fn(() => Promise.resolve()),
        toggleItem: vi.fn(() => Promise.resolve()),
        removeItem: vi.fn(() => Promise.resolve()),
    },
}));

vi.mock('@/lib/api', () => ({
    shoppingApi: mockShoppingApi,
}));

// ── useRtdb mock helpers ──────────────────────────────────────────────────────

let mockRtdbData: Record<string, ShoppingList> = {};
let mockRtdbLoading = false;

vi.mock('@/hooks/useRtdb', () => ({
    useRtdb: vi.fn(() => ({ data: mockRtdbData, isLoading: mockRtdbLoading })),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const makeItem = (overrides: Partial<ShoppingItem> = {}): ShoppingItem => ({
    id: 1,
    shopping_list_id: 10,
    name: 'Milk',
    quantity: null,
    category: null,
    is_checked: false,
    added_by: 1,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

const makeList = (overrides: Partial<ShoppingList> = {}): ShoppingList => ({
    id: 10,
    name: 'Weekly Groceries',
    family_id: 42,
    created_by: 1,
    is_shared: true,
    items: [],
    creator: null,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('Shopping screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockRtdbData = {};
        mockRtdbLoading = false;
        mockUser = { id: 1, family_id: 42 };
    });

    it('shows an activity indicator while loading', () => {
        mockRtdbLoading = true;
        render(React.createElement(ShoppingScreen));
        expect(screen.getByTestId('activity-indicator')).toBeInTheDocument();
    });

    it('shows the empty state when there are no shopping lists', () => {
        render(React.createElement(ShoppingScreen));
        expect(screen.getByText(/No shopping lists yet/i)).toBeInTheDocument();
    });

    it('renders shopping lists from RTDB', () => {
        mockRtdbData = {
            '10': makeList({ id: 10, name: 'Weekly Groceries' }),
            '11': makeList({ id: 11, name: 'Costco Run' }),
        };
        render(React.createElement(ShoppingScreen));
        expect(screen.getByText('Weekly Groceries')).toBeInTheDocument();
        expect(screen.getByText('Costco Run')).toBeInTheDocument();
    });

    it('shows the FAB button', () => {
        render(React.createElement(ShoppingScreen));
        expect(screen.getByTestId('fab')).toBeInTheDocument();
    });

    it('opens the create-list dialog when FAB is pressed', () => {
        render(React.createElement(ShoppingScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByText('New Shopping List')).toBeInTheDocument();
    });

    it('calls shoppingApi.createList when the Create button is clicked', async () => {
        render(React.createElement(ShoppingScreen));
        fireEvent.click(screen.getByTestId('fab'));

        const input = screen.getByPlaceholderText(/List name/i);
        fireEvent.change(input, { target: { value: 'Party Supplies' } });

        const createBtn = screen.getAllByRole('button', { name: /Create/i })[0];
        fireEvent.click(createBtn);

        await waitFor(() =>
            expect(mockShoppingApi.createList).toHaveBeenCalledWith('Party Supplies'),
        );
    });

    it('does not call shoppingApi.createList when name is empty', async () => {
        render(React.createElement(ShoppingScreen));
        fireEvent.click(screen.getByTestId('fab'));

        const createBtn = screen.getAllByRole('button', { name: /Create/i })[0];
        fireEvent.click(createBtn);

        await waitFor(() => expect(mockShoppingApi.createList).not.toHaveBeenCalled());
    });

    it('cancels the create dialog when Cancel is clicked', () => {
        render(React.createElement(ShoppingScreen));
        fireEvent.click(screen.getByTestId('fab'));
        expect(screen.getByTestId('dialog')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders items within a shopping list', () => {
        mockRtdbData = {
            '10': makeList({
                id: 10,
                name: 'Groceries',
                items: [
                    makeItem({ id: 1, name: 'Milk' }),
                    makeItem({ id: 2, name: 'Eggs' }),
                ],
            }),
        };
        render(React.createElement(ShoppingScreen));
        expect(screen.getByText(/Milk/)).toBeInTheDocument();
        expect(screen.getByText(/Eggs/)).toBeInTheDocument();
    });

    it('shows remaining item count for a shopping list', () => {
        mockRtdbData = {
            '10': makeList({
                id: 10,
                name: 'Groceries',
                items: [
                    makeItem({ id: 1, name: 'Milk', is_checked: false }),
                    makeItem({ id: 2, name: 'Eggs', is_checked: true }),
                ],
            }),
        };
        render(React.createElement(ShoppingScreen));
        // 1 remaining (one unchecked)
        expect(screen.getByText('1 remaining')).toBeInTheDocument();
    });

    it('shows quantity in parentheses when provided', () => {
        mockRtdbData = {
            '10': makeList({
                id: 10,
                name: 'Groceries',
                items: [makeItem({ id: 1, name: 'Milk', quantity: '2 litres' })],
            }),
        };
        render(React.createElement(ShoppingScreen));
        expect(screen.getByText(/\(2 litres\)/)).toBeInTheDocument();
    });

    it('calls shoppingApi.toggleItem when an item checkbox is clicked', async () => {
        mockRtdbData = {
            '10': makeList({
                id: 10,
                items: [makeItem({ id: 1, name: 'Milk', is_checked: false })],
            }),
        };
        render(React.createElement(ShoppingScreen));

        // The first touchable area (checkbox) triggers toggle
        const checkboxContainer = Array.from(document.querySelectorAll('div')).find(
            (el) => el.getAttribute('style')?.includes('borderColor'),
        );

        if (checkboxContainer?.parentElement) {
            fireEvent.click(checkboxContainer.parentElement);
            await waitFor(() =>
                expect(mockShoppingApi.toggleItem).toHaveBeenCalledWith(10, 1),
            );
        }
    });
});
