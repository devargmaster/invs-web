import { apiClient } from './apiClient';
import type { StoreProduct, StorePurchase, CreateStorePurchasePayload } from '../types/store';
import type { AddonCategory } from '../types/checkout';

export const storeService = {
  async getProducts(category?: AddonCategory): Promise<StoreProduct[]> {
    const query = category ? `?category=${category}` : '';
    return apiClient.get<StoreProduct[]>(`/store/products${query}`);
  },

  async create(payload: CreateStorePurchasePayload): Promise<StorePurchase> {
    return apiClient.post<StorePurchase>('/store-purchases', payload);
  },

  async payCard(purchaseId: string, cardToken: string, deviceSessionId: string): Promise<StorePurchase> {
    return apiClient.post<StorePurchase>(`/store-purchases/${purchaseId}/pay/card`, { cardToken, deviceSessionId });
  },

  async payMercadoPago(purchaseId: string): Promise<{ redirectUrl: string }> {
    return apiClient.post<{ redirectUrl: string }>(`/store-purchases/${purchaseId}/pay/mercadopago`, {});
  },

  // Ver el comentario de syncMercadoPago en ordersService.ts — mismo motivo.
  async syncMercadoPago(purchaseId: string, paymentId: string): Promise<StorePurchase> {
    return apiClient.post<StorePurchase>(`/store-purchases/${purchaseId}/sync-mercadopago`, { paymentId });
  },

  async uploadTransferProof(purchaseId: string, file: File, reference?: string): Promise<StorePurchase> {
    const formData = new FormData();
    formData.append('file', file);
    if (reference) formData.append('reference', reference);
    return apiClient.postForm<StorePurchase>(`/store-purchases/${purchaseId}/transfer-proof`, formData);
  },

  async getMyPurchases(): Promise<StorePurchase[]> {
    return apiClient.get<StorePurchase[]>('/store-purchases/me');
  },

  async getById(purchaseId: string): Promise<StorePurchase> {
    return apiClient.get<StorePurchase>(`/store-purchases/${purchaseId}`);
  },
};
