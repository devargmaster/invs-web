import { apiClient } from './apiClient';
import type { Landing } from '../types/landing';

export const landingsService = {
  async getBySlug(slug: string): Promise<Landing> {
    return apiClient.get<Landing>(`/landings/${slug}`);
  },
};
