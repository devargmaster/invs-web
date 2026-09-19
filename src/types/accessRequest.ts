export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AccessRequest {
  id: string;
  eventId: string;
  userId: string;
  code: string | null;
  note: string | null;
  status: AccessRequestStatus;
  rejectionReason: string | null;
  createdAt: string;
}

export interface CreateAccessRequestPayload {
  eventId: string;
  code?: string;
  note?: string;
}
