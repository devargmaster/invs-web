import { apiClient } from './apiClient';
import type { ThemePublicPayload } from '../types/theme';

export const themeService = {
  async get(): Promise<ThemePublicPayload> {
    return apiClient.get<ThemePublicPayload>('/theme');
  },
};
