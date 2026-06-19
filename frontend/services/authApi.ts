import { User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const handleResponse = async <T>(res: Response): Promise<T> => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data as T;
};

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<{ user: User }> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ user: User }>(res);
  },

  login: async (email: string, password: string): Promise<{ user: User }> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ user: User }>(res);
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include',
    });
    return handleResponse<{ user: User }>(res);
  },
};
