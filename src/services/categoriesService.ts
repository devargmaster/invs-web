import { apiClient } from './apiClient';
import type { TicketCategory, CategoryAvailability } from '../types/checkout';

export const categoriesService = {
  async getByEvent(eventId: string): Promise<TicketCategory[]> {
    return apiClient.get<TicketCategory[]>(`/events/${eventId}/categories`);
  },

  async getAvailability(categoryId: string): Promise<CategoryAvailability> {
    return apiClient.get<CategoryAvailability>(`/categories/${categoryId}/availability`);
  },
};
