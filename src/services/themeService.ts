import { apiClient } from './apiClient';
import type { ThemePalette } from '../types/theme';

export const themeService = {
  async get(): Promise<ThemePalette> {
    return apiClient.get<ThemePalette>('/theme');
  },
};
