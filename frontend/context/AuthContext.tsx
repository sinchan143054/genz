"use client";
import axios from 'axios';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: number;
  email: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  theme: string;
  accent_color: string;
  language: string;
  share_insights: boolean;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; name: string; password: string }) => Promise<void>;
  logout: () => void;
  getAuthHeaders: () => { Authorization?: string };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('growth_token') : null;
    if (saved) {
      setToken(saved);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error(error);
        setUser(null);
        setToken(null);
        localStorage.removeItem('growth_token');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [token]);

  const login = async (email: string, password: string) => {
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const newToken = response.data.access_token;
    setToken(newToken);
    localStorage.setItem('growth_token', newToken);
    router.push('/dashboard');
  };

  const register = async (data: { email: string; name: string; password: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, data);
    const newToken = response.data.access_token;
    setToken(newToken);
    localStorage.setItem('growth_token', newToken);
    router.push('/dashboard');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('growth_token');
    router.push('/signin');
  };

  const getAuthHeaders = useMemo(
    () => () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token],
  );

  return (
    <AuthContext.Provider value={{ user, loading, token, login, register, logout, getAuthHeaders }}>
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
