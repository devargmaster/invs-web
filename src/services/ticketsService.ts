import { apiClient } from './apiClient';
import type {
  Ticket, ValidateTicketResponse, TicketTransfer, TransferPublicDetail, IncomingTransfer,
} from '../types/tickets';

export interface RegisterAndAcceptResult {
  user: { id: string; email: string; fullName: string; role: string };
  accessToken: string;
  refreshToken: string;
}

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

  // ─── Compartir / transferir ─────────────────────────────────────
  async createTransfer(ticketId: string, toEmail: string): Promise<TicketTransfer> {
    return apiClient.post<TicketTransfer>(`/tickets/${ticketId}/transfers`, { toEmail });
  },

  async cancelTransfer(transferId: string): Promise<TicketTransfer> {
    return apiClient.delete<TicketTransfer>(`/tickets/transfers/${transferId}`);
  },

  async getIncomingTransfers(): Promise<IncomingTransfer[]> {
    return apiClient.get<IncomingTransfer[]>('/tickets/transfers/incoming');
  },

  async getTransferByToken(token: string): Promise<TransferPublicDetail> {
    return apiClient.get<TransferPublicDetail>(`/tickets/transfers/token/${token}`);
  },

  async acceptTransfer(token: string): Promise<{ success: boolean }> {
    return apiClient.post<{ success: boolean }>(`/tickets/transfers/token/${token}/accept`);
  },

  async registerAndAcceptTransfer(token: string, fullName: string, password: string): Promise<RegisterAndAcceptResult> {
    return apiClient.post<RegisterAndAcceptResult>(`/tickets/transfers/token/${token}/register-and-accept`, {
      fullName,
      password,
    });
  },
};
