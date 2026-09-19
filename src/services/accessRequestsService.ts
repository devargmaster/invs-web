import { apiClient } from './apiClient';
import type { AccessRequest, CreateAccessRequestPayload } from '../types/accessRequest';

export const accessRequestsService = {
  async create(payload: CreateAccessRequestPayload): Promise<AccessRequest> {
    return apiClient.post<AccessRequest>('/access-requests', payload);
  },

  async getMine(eventId: string): Promise<AccessRequest | null> {
    return apiClient.get<AccessRequest | null>(`/access-requests/me?eventId=${eventId}`);
  },
};
