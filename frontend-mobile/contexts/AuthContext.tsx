import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredUser, getStoredToken, login as authLogin, logout as authLogout, fetchAndStoreCoachClientId } from '../services/auth.service';
import type { AuthUser } from '../types/api.types';

interface AuthState {
  user: AuthUser | null;
  coachClientId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    coachClientId: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadSession = useCallback(async () => {
    const token = await getStoredToken();
    if (!token) {
      setState({ user: null, coachClientId: null, isLoading: false, isAuthenticated: false });
      return;
    }
    const user = await getStoredUser();
    if (!user) {
      setState({ user: null, coachClientId: null, isLoading: false, isAuthenticated: false });
      return;
    }
    const coachClientId = await fetchAndStoreCoachClientId(user.userId);
    setState({ user, coachClientId, isLoading: false, isAuthenticated: true });
  }, []);

  useEffect(() => { loadSession(); }, [loadSession]);

  const login = useCallback(async (emailOrPhone: string, password: string) => {
    const authRes = await authLogin(emailOrPhone, password);
    const coachClientId = await fetchAndStoreCoachClientId(authRes.user.userId);
    setState({ user: authRes.user, coachClientId, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setState({ user: null, coachClientId: null, isLoading: false, isAuthenticated: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
