import { apiClient } from './apiClient';
import type { ContentPurchase, CreateContentPurchasePayload } from '../types/content';

export const contentPurchasesService = {
  async create(payload: CreateContentPurchasePayload): Promise<ContentPurchase> {
    return apiClient.post<ContentPurchase>('/content-purchases', payload);
  },

  async payCard(purchaseId: string, cardToken: string, deviceSessionId: string): Promise<ContentPurchase> {
    return apiClient.post<ContentPurchase>(`/content-purchases/${purchaseId}/pay/card`, { cardToken, deviceSessionId });
  },

  async uploadTransferProof(purchaseId: string, file: File, reference?: string): Promise<ContentPurchase> {
    const formData = new FormData();
    formData.append('file', file);
    if (reference) formData.append('reference', reference);
    return apiClient.postForm<ContentPurchase>(`/content-purchases/${purchaseId}/transfer-proof`, formData);
  },

  async getMyPurchases(): Promise<ContentPurchase[]> {
    return apiClient.get<ContentPurchase[]>('/content-purchases/me');
  },

  async getById(purchaseId: string): Promise<ContentPurchase> {
    return apiClient.get<ContentPurchase>(`/content-purchases/${purchaseId}`);
  },
};
