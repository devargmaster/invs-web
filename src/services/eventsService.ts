import { apiClient } from './apiClient';
import type { Event } from '../types/events';

export const eventsService = {
  async getAll(filters?: { mode?: string; upcoming?: boolean }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.mode) params.append('mode', filters.mode);
    if (filters?.upcoming) params.append('upcoming', 'true');
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<Event[]>(`/events${query}`);
  },

  async getById(id: string): Promise<Event> {
    return apiClient.get<Event>(`/events/${id}`);
  },
};
