import { apiClient, setToken } from './apiClient';
import type { LoginResponse, AuthUser } from '../types/auth';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
    setToken(res.accessToken);
    return res;
  },

  async loginWithGoogle(idToken: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>('/auth/google', { idToken });
    setToken(res.accessToken);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setToken(null);
    }
  },

  async refresh(): Promise<{ accessToken: string }> {
    const res = await apiClient.post<{ accessToken: string }>('/auth/refresh');
    setToken(res.accessToken);
    return res;
  },

  async getMe(): Promise<AuthUser & { subscription?: { status: string; planName: string } | null }> {
    return apiClient.get('/users/me');
  },
};
