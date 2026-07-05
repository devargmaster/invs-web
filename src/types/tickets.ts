export interface Ticket {
  id: string;
  userId: string;
  eventId: string;
  qrPayload: string;
  used: boolean;
  usedAt: string | null;
  expiresAt: string;
  createdAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    location: string | null;
    mode: string;
  };
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
