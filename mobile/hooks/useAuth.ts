import { useEffect } from 'react';
import { authApi } from '@/lib/api';
import { storage } from '@/lib/storage';
import { clearCredentials, setCredentials, setLoading } from '@/store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '@/store';

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

        if (cancelled) return;

        if (savedToken && savedUser) {
          dispatch(setCredentials({ token: savedToken, user: savedUser }));
        } else {
          dispatch(setLoading(false));
        }
      } catch {
        if (!cancelled) dispatch(setLoading(false));
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

  return { user, token, isLoading, login, register, logout };
}
