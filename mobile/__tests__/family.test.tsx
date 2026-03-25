/**
 * Tests for mobile/app/(tabs)/family.tsx
 *
 * Covers:
 * - Loading state
 * - No-family state: "Create a Family" / "Join with Invite Code" buttons
 * - Create family dialog flow
 * - Join family dialog flow
 * - Displaying family details (name, invite code, members)
 * - Copying invite code to clipboard
 */

import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FamilyScreen from '@/app/(tabs)/family';
import type { AuthUser, Family } from '@/lib/api';

// ── react-native-paper mock ───────────────────────────────────────────────────

vi.mock('react-native-paper', async () => {
    const React = await import('react');

    const stub = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children ?? null);

    const Button = ({
        children,
        onPress,
        disabled,
        loading,
        testID,
        mode,
    }: {
        children?: React.ReactNode;
        onPress?: () => void;
        disabled?: boolean;
        loading?: boolean;
        testID?: string;
        mode?: string;
    }) =>
        React.createElement(
            'button',
            { onClick: onPress, disabled: disabled || loading, 'data-testid': testID, 'data-mode': mode },
            children,
        );

    const TextInput = ({
        value,
        onChangeText,
        testID,
        label,
        placeholder,
    }: {
        value?: string;
        onChangeText?: (v: string) => void;
        testID?: string;
        label?: string;
        placeholder?: string;
    }) =>
        React.createElement('input', {
            'data-testid': testID,
            value: value ?? '',
            placeholder: placeholder ?? label,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChangeText?.(e.target.value),
        });

    const ActivityIndicator = () => React.createElement('div', { 'data-testid': 'activity-indicator' });

    const Avatar = {
        Text: ({ label, size }: { label?: string; size?: number }) =>
            React.createElement('div', { 'data-testid': 'avatar', 'aria-label': label }, label),
    };

    const Chip = ({
        children,
        onPress,
    }: {
        children?: React.ReactNode;
        onPress?: () => void;
        compact?: boolean;
        icon?: string;
    }) =>
        React.createElement('button', { onClick: onPress, 'data-testid': 'chip' }, children);

    const Card = Object.assign(stub, {
        Content: stub,
    });

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
                React.createElement('h2', { 'data-testid': 'dialog-title' }, children),
            Content: stub,
            Actions: stub,
        },
    );

    return {
        ActivityIndicator,
        Avatar,
        Button,
        Card,
        Chip,
        Dialog,
        Portal: stub,
        TextInput,
    };
});

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({ children }: { children?: React.ReactNode }) =>
        React.createElement('span', {}, children ?? null),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children ?? null),
}));

vi.mock('@/constants/Colors', () => ({
    Colors: { light: { card: '#fff' }, dark: { card: '#000' } },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

// ── familyApi mock ────────────────────────────────────────────────────────────

const mockFamilyApi = {
    get: vi.fn(),
    create: vi.fn(),
    join: vi.fn(),
};

vi.mock('@/lib/api', () => ({
    familyApi: mockFamilyApi,
}));

// ── useAuth mock ──────────────────────────────────────────────────────────────

let mockAuthUser: AuthUser | null = null;
const mockRefreshUser = vi.fn(() => Promise.resolve());

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockAuthUser,
        refreshUser: mockRefreshUser,
    }),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const baseUser: AuthUser = {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    profile_color: '#3B82F6',
    family_id: 42,
    inbound_email_address: null,
};

const baseFamily: Family = {
    id: 42,
    name: 'The Smiths',
    invite_code: 'ABCD1234',
    location_name: null,
    latitude: null,
    longitude: null,
    members: [
        {
            id: 1,
            name: 'Alice Smith',
            email: 'alice@example.com',
            profile_color: '#3B82F6',
            role: 'Admin',
        },
        {
            id: 2,
            name: 'Bob Smith',
            email: 'bob@example.com',
            profile_color: '#22C55E',
            role: 'Member',
        },
    ],
};

// ── tests ─────────────────────────────────────────────────────────────────────

describe('Family screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthUser = baseUser;
    });

    describe('when the user has no family', () => {
        beforeEach(() => {
            mockAuthUser = { ...baseUser, family_id: null };
        });

        it('shows "No Family Yet" heading after load', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByText('No Family Yet')).toBeInTheDocument(),
            );
        });

        it('shows "Create a Family" button', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByRole('button', { name: /Create a Family/i })).toBeInTheDocument(),
            );
        });

        it('shows "Join with Invite Code" button', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByRole('button', { name: /Join with Invite Code/i })).toBeInTheDocument(),
            );
        });

        it('opens the Create dialog when "Create a Family" is clicked', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                screen.getByRole('button', { name: /Create a Family/i }),
            );
            fireEvent.click(screen.getByRole('button', { name: /Create a Family/i }));
            expect(screen.getByText('Create a Family')).toBeInTheDocument();
        });

        it('opens the Join dialog when "Join with Invite Code" is clicked', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                screen.getByRole('button', { name: /Join with Invite Code/i }),
            );
            fireEvent.click(screen.getByRole('button', { name: /Join with Invite Code/i }));
            expect(screen.getByText('Join a Family')).toBeInTheDocument();
        });

        it('calls familyApi.create and refreshUser on successful family creation', async () => {
            mockFamilyApi.create.mockResolvedValue(baseFamily);
            render(React.createElement(FamilyScreen));

            await waitFor(() =>
                screen.getByRole('button', { name: /Create a Family/i }),
            );
            fireEvent.click(screen.getByRole('button', { name: /Create a Family/i }));

            const input = screen.getByPlaceholderText(/e.g. The Smith Family/i);
            fireEvent.change(input, { target: { value: 'My Family' } });

            const createBtn = screen.getAllByRole('button', { name: /Create/i }).find(
                (b) => b.textContent === 'Create',
            );
            fireEvent.click(createBtn!);

            await waitFor(() =>
                expect(mockFamilyApi.create).toHaveBeenCalledWith('My Family'),
            );
            await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
        });

        it('calls familyApi.join and refreshUser on successful join', async () => {
            mockFamilyApi.join.mockResolvedValue(baseFamily);
            render(React.createElement(FamilyScreen));

            await waitFor(() =>
                screen.getByRole('button', { name: /Join with Invite Code/i }),
            );
            fireEvent.click(screen.getByRole('button', { name: /Join with Invite Code/i }));

            const input = screen.getByPlaceholderText(/e.g. ABCD1234/i);
            fireEvent.change(input, { target: { value: 'ABCD1234' } });

            const joinBtn = screen.getAllByRole('button', { name: /Join/i }).find(
                (b) => b.textContent === 'Join',
            );
            fireEvent.click(joinBtn!);

            await waitFor(() =>
                expect(mockFamilyApi.join).toHaveBeenCalledWith('ABCD1234'),
            );
            await waitFor(() => expect(mockRefreshUser).toHaveBeenCalled());
        });
    });

    describe('when the user has a family', () => {
        beforeEach(() => {
            mockFamilyApi.get.mockResolvedValue(baseFamily);
        });

        it('shows the family name after load', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByText('The Smiths')).toBeInTheDocument(),
            );
        });

        it('shows the invite code', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByText('ABCD1234')).toBeInTheDocument(),
            );
        });

        it('shows all family members', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() => {
                expect(screen.getByText('Alice Smith')).toBeInTheDocument();
                expect(screen.getByText('Bob Smith')).toBeInTheDocument();
            });
        });

        it('shows member count', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByText(/Members \(2\)/i)).toBeInTheDocument(),
            );
        });

        it('copies the invite code to the clipboard when the copy button is pressed', async () => {
            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                screen.getByText('ABCD1234'),
            );

            const copyBtn = screen.getAllByRole('button', { name: /Copy/i })[0];
            fireEvent.click(copyBtn);

            await waitFor(() =>
                expect(vi.mocked(Clipboard.setStringAsync)).toHaveBeenCalledWith('ABCD1234'),
            );
        });

        it('shows location name when provided', async () => {
            mockFamilyApi.get.mockResolvedValue({
                ...baseFamily,
                location_name: 'London, UK',
            });

            render(React.createElement(FamilyScreen));
            await waitFor(() =>
                expect(screen.getByText(/London, UK/i)).toBeInTheDocument(),
            );
        });
    });
});
