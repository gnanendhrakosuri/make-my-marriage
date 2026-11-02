'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/constants';

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: string;
  partnerName?: string | null;
  phone?: string | null;
  weddingDate?: string | null;
  weddingId?: string | null;
}

interface AuthContextType {
  user: UserPublic | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: UserPublic, token?: string) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Synchronize user verification with backend session cookie
  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.data?.user) {
          setUser(data.data.user);
          try {
            localStorage.setItem('mmm_user', JSON.stringify(data.data.user));
          } catch {
            // localStorage not available
          }
          return;
        }
      }

      // If backend reports unauthenticated, check if a stored user exists or clear it
      setUser(null);
      try {
        localStorage.removeItem('mmm_user');
        localStorage.removeItem('mmm_token');
      } catch {
        // localStorage not available
      }
    } catch {
      // Backend may be unreachable; fallback to localStorage if available
      try {
        const stored = localStorage.getItem('mmm_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial mount: hydrate immediately from localStorage, then verify with server
  useEffect(() => {
    try {
      const cached = localStorage.getItem('mmm_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // Ignore storage errors
    }

    refreshUser();
  }, [refreshUser]);

  const login = (userData: UserPublic, token?: string) => {
    setUser(userData);
    try {
      localStorage.setItem('mmm_user', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('mmm_token', token);
      }
    } catch {
      // Storage unavailable
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      try {
        localStorage.removeItem('mmm_user');
        localStorage.removeItem('mmm_token');
      } catch {
        // Storage unavailable
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
