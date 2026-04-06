/**
 * Tests for mobile/hooks/useAuth.ts
 *
 * Covers:
 * - Restoring token and user from SecureStore on mount
 * - setLoading(false) when storage is empty
 * - setLoading(false) on storage error
 * - login() calls authApi.login, persists credentials, dispatches setCredentials
 * - register() calls authApi.register, persists credentials, dispatches setCredentials
 * - logout() calls authApi.logout (best-effort), clears storage, dispatches clearCredentials
 * - logout() clears storage even when authApi.logout fails
 * - refreshUser() calls authApi.me, persists updated user, dispatches setUser
 * - refreshUser() is silent on API error
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/hooks/useAuth';

// ── authApi mock ──────────────────────────────────────────────────────────────

const { mockAuthApi } = vi.hoisted(() => ({
    mockAuthApi: {
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        me: vi.fn(),
    },
}));

vi.mock('@/lib/api', () => ({
    authApi: mockAuthApi,
}));

// ── Redux store mock ──────────────────────────────────────────────────────────

const mockDispatch = vi.fn();
const mockSelector = vi.fn();

vi.mock('@/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}));

// ── fixtures ──────────────────────────────────────────────────────────────────

const fakeUser = { id: 1, name: 'Alice', email: 'alice@example.com', family_id: 42 };
const fakeToken = 'test-token-abc';

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useAuth', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default selector returns empty auth state (not loaded yet)
        mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
            selector({ auth: { user: null, token: null, isLoading: true } }),
        );
        // Default storage: empty
        vi.mocked(getItemAsync).mockResolvedValue(null);
        vi.mocked(setItemAsync).mockResolvedValue(undefined);
        vi.mocked(deleteItemAsync).mockResolvedValue(undefined);
    });

    it('dispatches setCredentials when stored token and user are found', async () => {
        vi.mocked(getItemAsync).mockImplementation(async (key) => {
            if (key === 'flowki_auth_token') {
return fakeToken;
}

            if (key === 'flowki_user') {
return JSON.stringify(fakeUser);
}

            return null;
        });

        renderHook(() => useAuth());

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: { token: fakeToken, user: fakeUser },
                }),
            );
        });
    });

    it('dispatches setLoading(false) when storage is empty', async () => {
        vi.mocked(getItemAsync).mockResolvedValue(null);

        renderHook(() => useAuth());

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({ payload: false }),
            );
        });
    });

    it('dispatches setLoading(false) when storage throws', async () => {
        vi.mocked(getItemAsync).mockRejectedValue(new Error('SecureStore error'));

        renderHook(() => useAuth());

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(
                expect.objectContaining({ payload: false }),
            );
        });
    });

    it('login() saves token and user to storage then dispatches setCredentials', async () => {
        mockAuthApi.login.mockResolvedValue({ token: fakeToken, user: fakeUser });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.login('alice@example.com', 'password');
        });

        expect(mockAuthApi.login).toHaveBeenCalledWith('alice@example.com', 'password');
        expect(setItemAsync).toHaveBeenCalledWith('flowki_auth_token', fakeToken);
        expect(setItemAsync).toHaveBeenCalledWith('flowki_user', JSON.stringify(fakeUser));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { token: fakeToken, user: fakeUser },
            }),
        );
    });

    it('register() saves token and user to storage then dispatches setCredentials', async () => {
        mockAuthApi.register.mockResolvedValue({ token: fakeToken, user: fakeUser });

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.register('Alice', 'alice@example.com', 'password', 'password');
        });

        expect(mockAuthApi.register).toHaveBeenCalledWith(
            'Alice',
            'alice@example.com',
            'password',
            'password',
        );
        expect(setItemAsync).toHaveBeenCalledWith('flowki_auth_token', fakeToken);
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({
                payload: { token: fakeToken, user: fakeUser },
            }),
        );
    });

    it('logout() calls authApi.logout, clears storage, dispatches clearCredentials', async () => {
        mockAuthApi.logout.mockResolvedValue(undefined);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logout();
        });

        expect(mockAuthApi.logout).toHaveBeenCalled();
        expect(deleteItemAsync).toHaveBeenCalledWith('flowki_auth_token');
        expect(deleteItemAsync).toHaveBeenCalledWith('flowki_user');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'auth/clearCredentials' }),
        );
    });

    it('logout() still clears storage even when authApi.logout throws', async () => {
        mockAuthApi.logout.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logout();
        });

        expect(deleteItemAsync).toHaveBeenCalledWith('flowki_auth_token');
        expect(deleteItemAsync).toHaveBeenCalledWith('flowki_user');
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'auth/clearCredentials' }),
        );
    });

    it('refreshUser() calls authApi.me, saves user, dispatches setUser', async () => {
        const refreshedUser = { ...fakeUser, name: 'Alice Updated' };
        mockAuthApi.me.mockResolvedValue(refreshedUser);

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.refreshUser();
        });

        expect(mockAuthApi.me).toHaveBeenCalled();
        expect(setItemAsync).toHaveBeenCalledWith('flowki_user', JSON.stringify(refreshedUser));
        expect(mockDispatch).toHaveBeenCalledWith(
            expect.objectContaining({ payload: refreshedUser }),
        );
    });

    it('refreshUser() is silent when authApi.me throws', async () => {
        mockAuthApi.me.mockRejectedValue(new Error('Server error'));

        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await expect(result.current.refreshUser()).resolves.toBeUndefined();
        });
    });
});
