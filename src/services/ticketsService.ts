import { apiClient } from './apiClient';
import type { Ticket, ValidateTicketResponse } from '../types/tickets';

export const ticketsService = {
  async getMyTickets(): Promise<Ticket[]> {
    return apiClient.get<Ticket[]>('/tickets/me');
  },

  async getTicketsForEvent(eventId: string): Promise<Ticket[]> {
    const tickets = await ticketsService.getMyTickets();
    return tickets.filter((t) => t.eventId === eventId);
  },

  async validateQr(qrPayload: string): Promise<ValidateTicketResponse> {
    return apiClient.post<ValidateTicketResponse>('/tickets/validate', { qrPayload });
  },
};
