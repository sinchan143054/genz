import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('growth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export function authHeaders(token?: string): Record<string, string> {
  const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('growth_token') : null);
  return activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
}

