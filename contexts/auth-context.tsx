'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/services/auth';
import { User, AuthResponse } from '@/types/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, fullName: string, password: string) => Promise<User>;
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
    // Check for existing token on mount
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    if (storedToken) {
      setToken(storedToken);
      // Verify token and get user data
      authApi.getCurrentUser()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else if (storedRefreshToken) {
      // Let apiClient auto-refresh on first authenticated request.
      authApi.getCurrentUser()
        .then((u) => {
          setUser(u);
          setToken(localStorage.getItem('access_token'));
        })
        .catch(() => {
          localStorage.removeItem('refresh_token');
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const onLogout = () => {
      setUser(null);
      setToken(null);
    };
    const onToken = () => {
      setToken(localStorage.getItem('access_token'));
    };
    window.addEventListener('auth:logout', onLogout);
    window.addEventListener('auth:token', onToken);
    return () => {
      window.removeEventListener('auth:logout', onLogout);
      window.removeEventListener('auth:token', onToken);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authResponse: AuthResponse = await authApi.login({ email, password });
      setUser(authResponse.user);
      setToken(authResponse.access_token);
      localStorage.setItem('access_token', authResponse.access_token);
      localStorage.setItem('refresh_token', authResponse.refresh_token);
      return authResponse.user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, fullName: string, password: string) => {
    try {
      const createdUser = await authApi.register({
        email,
        full_name: fullName,
        password,
      });
      return createdUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    authApi.logout().catch(() => {
      // Ignore logout errors
    });
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user && !!token,
    isAdmin: !!user?.is_admin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
