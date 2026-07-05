import { apiClient } from './apiClient';
import type { Ticket, ValidateTicketResponse } from '../types/tickets';

export const ticketsService = {
  async createTicket(eventId: string): Promise<Ticket> {
    return apiClient.post<Ticket>('/tickets', { eventId });
  },

  async getMyTickets(): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>('/tickets/me');
  },

  async getTicketForEvent(eventId: string): Promise<Ticket | null> {
    const tickets = await ticketsService.getMyTickets();
    return tickets.find((t) => t.eventId === eventId && !t.used) ?? null;
  },

  async validateQr(qrPayload: string): Promise<ValidateTicketResponse> {
    return apiClient.post<ValidateTicketResponse>('/tickets/validate', { qrPayload });
  },
};
