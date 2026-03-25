/**
 * Tests for mobile/app/(tabs)/settings.tsx
 *
 * Verifies the Settings screen renders key sections and that the inbound
 * email address UI is displayed (with a copy button) when the user has one.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as Clipboard from 'expo-clipboard';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SettingsScreen from '@/app/(tabs)/settings';
import type { AuthUser } from '@/lib/api';

// ── mocks ────────────────────────────────────────────────────────────────────

// react-native is aliased to __mocks__/react-native.ts via vitest.config.ts.

vi.mock('react-native-paper', async () => {
    const React = await import('react');
    const stub = ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', {}, children ?? null);
    const Button = ({ children, onPress, testID }: { children?: React.ReactNode; onPress?: () => void; testID?: string }) =>
        React.createElement('button', { onClick: onPress, 'data-testid': testID }, children);
    const List = {
        Item: ({ title, description }: { title?: string; description?: string }) =>
            React.createElement('div', { 'data-testid': 'list-item' }, [
                React.createElement('span', { key: 'title' }, title),
                description ? React.createElement('span', { key: 'desc' }, description) : null,
            ]),
        Icon: () => null,
    };
    const DialogComp = Object.assign(
        stub,
        {
            Title: ({ children }: { children?: React.ReactNode }) =>
                React.createElement('div', { 'data-testid': 'dialog-title' }, children),
            Content: stub,
            Actions: stub,
            ScrollArea: stub,
        },
    );

    return { Button, Card: stub, Divider: stub, List, Portal: stub, Dialog: DialogComp, TextInput: stub };
});

vi.mock('@/components/ThemedText', () => ({
    ThemedText: ({ children }: { children: React.ReactNode }) =>
        React.createElement('span', {}, children),
}));

vi.mock('@/components/ThemedView', () => ({
    ThemedView: ({ children }: { children: React.ReactNode }) =>
        React.createElement('div', {}, children),
}));

vi.mock('@/constants/Colors', () => ({
    Colors: { light: { card: '#fff' }, dark: { card: '#000' } },
}));

vi.mock('@/hooks/useColorScheme', () => ({
    useColorScheme: () => 'light',
}));

vi.mock('@/lib/api', () => ({
    profileApi: {
        update: vi.fn(() => Promise.resolve({})),
        updatePassword: vi.fn(() => Promise.resolve({ message: 'ok' })),
    },
}));

const baseUser: AuthUser = {
    id: 1,
    name: 'Alice Smith',
    email: 'alice@example.com',
    profile_color: '#3B82F6',
    family_id: 1,
    inbound_email_address: 'abc123@in.flowki.family',
};

const mockLogout = vi.fn();
const mockRefreshUser = vi.fn(() => Promise.resolve());

// useAuth is mutable so tests can override the returned user
let mockAuthUser: AuthUser | null = baseUser;

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({
        user: mockAuthUser,
        logout: mockLogout,
        refreshUser: mockRefreshUser,
    }),
}));

// ── import component after mocks are registered ───────────────────────────────

// ── tests ────────────────────────────────────────────────────────────────────

describe('Settings screen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthUser = baseUser;
    });

    it('renders the Edit Profile list item', () => {
        render(React.createElement(SettingsScreen));
        // "Edit Profile" appears in both the list-item span and the dialog title div;
        // confirm at least one is in the document
        expect(screen.getAllByText('Edit Profile').length).toBeGreaterThan(0);
    });

    it('renders the Change Password list item', () => {
        render(React.createElement(SettingsScreen));
        expect(screen.getAllByText('Change Password').length).toBeGreaterThan(0);
    });

    it('renders the inbound email address section when provided', () => {
        render(React.createElement(SettingsScreen));
        expect(screen.getByText('Inbound email address')).toBeInTheDocument();
        expect(screen.getByText('abc123@in.flowki.family')).toBeInTheDocument();
    });

    it('renders the Copy button for the inbound email address', () => {
        render(React.createElement(SettingsScreen));
        const copyBtns = screen.getAllByRole('button', { name: /copy/i });
        expect(copyBtns.length).toBeGreaterThan(0);
    });

    it('copies the inbound email address to the clipboard when Copy is pressed', async () => {
        render(React.createElement(SettingsScreen));
        const [copyBtn] = screen.getAllByRole('button', { name: /copy/i });
        fireEvent.click(copyBtn);
        await waitFor(() =>
            expect(vi.mocked(Clipboard.setStringAsync)).toHaveBeenCalledWith(
                'abc123@in.flowki.family',
            ),
        );
    });

    it('does not render the inbound email section when address is absent', () => {
        mockAuthUser = { ...baseUser, inbound_email_address: null };
        render(React.createElement(SettingsScreen));
        expect(screen.queryByText('Inbound email address')).not.toBeInTheDocument();
    });
});
