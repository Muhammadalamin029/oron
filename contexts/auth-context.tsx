'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/services/auth';
import { tokenStore } from '@/lib/token-store';
import { User, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, fullName: string, password: string) => Promise<User>;
  applySession: (authResponse: AuthResponse) => void;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount (only on client side)
    if (typeof window === 'undefined') return;
    
    const storedToken = tokenStore.getAccess();
    const storedRefreshToken = tokenStore.getRefresh();
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => {
          tokenStore.clearAll();
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else if (storedRefreshToken) {
      // Let apiClient auto-refresh on first authenticated request.
      authApi.getCurrentUser()
        .then((u) => {
          setUser(u);
          setToken(tokenStore.getAccess());
        })
        .catch(() => {
          tokenStore.clearRefresh();
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const onLogout = () => {
      setUser(null);
      setToken(null);
    };
    const onToken = () => {
      setToken(tokenStore.getAccess());
    };
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('auth:token', onToken);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('auth:token', onToken);
    };
  }, []);

  const applySession = useCallback((authResponse: AuthResponse) => {
    setUser(authResponse.user);
    setToken(authResponse.access_token);
    if (typeof window !== 'undefined') {
      tokenStore.setAccess(authResponse.access_token);
      tokenStore.setRefresh(authResponse.refresh_token);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const authResponse: AuthResponse = await authApi.login({ email, password });
    applySession(authResponse);
    return authResponse.user;
  }, [applySession]);

  const register = useCallback(async (email: string, fullName: string, password: string) => {
    const createdUser = await authApi.register({
      email,
      full_name: fullName,
      password,
    });
    return createdUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      tokenStore.clearAll();
    }
    authApi.logout().catch(() => {
      // Ignore logout errors
    });
  }, []);

  const isAuthenticated = !!user && !!token;
  const isAdmin = !!user?.is_admin;

  const value: AuthContextType = useMemo(
    () => ({
      user,
      token,
      setUser,
      login,
      register,
      applySession,
      logout,
      loading,
      isAuthenticated,
      isAdmin,
    }),
    [user, token, login, register, applySession, logout, loading, isAuthenticated, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
