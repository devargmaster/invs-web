import { apiClient } from './apiClient';
import type { AddOn } from '../types/checkout';

export const addonsService = {
  async getByEvent(eventId: string): Promise<AddOn[]> {
    return apiClient.get<AddOn[]>(`/events/${eventId}/addons`);
  },
};
