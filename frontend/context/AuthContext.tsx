"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import axios from 'axios';

interface UserProfile {
  id: number;
  clerk_id?: string;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  theme: string;
  accent_color: string;
  language: string;
  share_insights: boolean;
  notify_daily_reminder?: boolean;
  notify_streak_milestones?: boolean;
  notify_weekly_digest?: boolean;
  tree_points?: number;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  logout: () => void;
  refetchUser: () => Promise<void>;
  setAuthToken: (token: string) => void;
  getAuthHeaders: () => { Authorization?: string };
}

import { API_BASE_URL } from '../lib/api';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const syncBackendUser = async () => {
    try {
      let jwtToken: string | null = token;

      if (!jwtToken) {
        try {
          jwtToken = await getToken();
        } catch (err) {
          console.log("Clerk token note:", err);
        }
      }

      if (!jwtToken && typeof window !== 'undefined') {
        jwtToken = localStorage.getItem('growth_token');
      }

      if (jwtToken) {
        setToken(jwtToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('growth_token', jwtToken);
        }

        const res = await axios.get(
          `${API_BASE_URL}/api/auth/me`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );

        if (res.data) {
          setUser(res.data);
          return;
        }
      }

      if (clerkUser) {
        setUser({
          id: 0,
          clerk_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || 'explorer@genzgrowth.app',
          name: clerkUser.fullName || clerkUser.firstName || 'Growth Explorer',
          avatar_url: clerkUser.imageUrl,
          theme: 'dark',
          accent_color: '#7c3aed',
          language: 'en',
          share_insights: true,
          tree_points: 0,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Backend auth sync error:", error);
      if (clerkUser) {
        setUser({
          id: 0,
          clerk_id: clerkUser.id,
          email: clerkUser.primaryEmailAddress?.emailAddress || 'explorer@genzgrowth.app',
          name: clerkUser.fullName || clerkUser.firstName || 'Growth Explorer',
          avatar_url: clerkUser.imageUrl,
          theme: 'dark',
          accent_color: '#7c3aed',
          language: 'en',
          share_insights: true,
          tree_points: 0,
        });
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clerkLoaded) {
      syncBackendUser();
    }
  }, [clerkLoaded, clerkUser]);

  const setAuthToken = (newToken: string) => {
    setToken(newToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('growth_token', newToken);
    }
    syncBackendUser();
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('growth_token');
    }
    try {
      signOut();
    } catch (err) {
      console.log("Signout note:", err);
    }
  };

  const getAuthHeaders = useMemo(
    () => () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return (
    <AuthContext.Provider value={{ user, loading, token, logout, refetchUser: syncBackendUser, setAuthToken, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

