import type { TicketCategory } from './checkout';

export type TicketStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'USED' | 'CANCELLED';
export type TicketTransferStatus = 'PENDING' | 'ACCEPTED' | 'CANCELLED' | 'EXPIRED';

export interface TicketTransfer {
  id: string;
  ticketId: string;
  fromUserId: string;
  toEmail: string;
  toUserId: string | null;
  status: TicketTransferStatus;
  token: string;
  expiresAt: string;
  acceptedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  orderId: string;
  categoryId: string;
  eventId: string;
  holderUserId: string | null;
  purchaserUserId: string;
  status: TicketStatus;
  qrPayload: string | null;
  usedAt: string | null;
  scannedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    location: string | null;
    mode: string;
  };
  category?: TicketCategory;
  /** Transferencias PENDING de esta entrada (a lo sumo una a la vez). */
  transfers?: TicketTransfer[];
}

export interface ValidateTicketResponse {
  valid: boolean;
  message: string;
  ticket?: {
    id: string;
    attendee: string;
    event: string;
    validatedAt: string;
  };
}

export type ValidateErrorReason =
  | 'ALREADY_USED'
  | 'EXPIRED'
  | 'INVALID_SIGNATURE'
  | 'NOT_FOUND'
  | 'UNKNOWN';

// ─── Transferencia: aceptar / detalle público ──────────────────────
export interface TransferPublicDetail {
  eventTitle: string;
  categoryName: string;
  fromUserName: string;
  toEmail: string;
  recipientHasAccount: boolean;
}

export interface IncomingTransfer extends TicketTransfer {
  ticket: {
    id: string;
    event: { id: string; title: string; date: string };
    category: TicketCategory;
  };
  fromUser: { fullName: string };
}
