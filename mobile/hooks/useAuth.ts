import { useAppDispatch, useAppSelector } from '@/store';
import { clearCredentials, setCredentials, setLoading, setUser } from '@/store/slices/authSlice';
import { useEffect } from 'react';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/storage';

/**
 * Bootstraps auth state from SecureStore on mount and exposes helpers for
 * login, register and logout.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isLoading } = useAppSelector((s) => s.auth);

  // Restore persisted session on first render
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [savedToken, savedUser] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
        ]);

        if (cancelled) {
return;
}

        if (savedToken && savedUser) {
          dispatch(setCredentials({ token: savedToken, user: savedUser }));
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        if (!cancelled) {
dispatch(setLoading(false));
}
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const login = async (email: string, password: string) => {
    const { token: t, user: u } = await authApi.login(email, password);
    await storage.setToken(t);
    await storage.setUser(u);
    dispatch(setCredentials({ token: t, user: u }));
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => {
    const { token: t, user: u } = await authApi.register(
      name,
      email,
      password,
      passwordConfirmation,
    );
    await storage.setToken(t);
    await storage.setUser(u);
    dispatch(setCredentials({ token: t, user: u }));
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // best-effort
    } finally {
      await storage.clear();
      dispatch(clearCredentials());
    }
  };

  /** Re-fetch the user from the server and persist the refreshed data. */
  const refreshUser = async () => {
    try {
      const u = await authApi.me();

      if (u) {
        await storage.setUser(u);
        dispatch(setUser(u));
      }
    } catch {
      // best-effort
    }
  };

  return { user, token, isLoading, login, register, logout, refreshUser };
}

