import { apiClient } from './apiClient';
import type { Order, CreateOrderPayload } from '../types/checkout';

export interface BankTransferInfo {
  bankName: string;
  accountHolder: string;
  cbu: string;
  alias: string;
  cuit: string;
}

export const ordersService = {
  async create(payload: CreateOrderPayload): Promise<Order> {
    return apiClient.post<Order>('/orders', payload);
  },

  async payCard(orderId: string, cardToken: string, deviceSessionId: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/pay/card`, { cardToken, deviceSessionId });
  },

  async payMercadoPago(orderId: string): Promise<{ redirectUrl: string }> {
    return apiClient.post<{ redirectUrl: string }>(`/orders/${orderId}/pay/mercadopago`, {});
  },

  async uploadTransferProof(orderId: string, file: File, reference?: string): Promise<Order> {
    const formData = new FormData();
    formData.append('file', file);
    if (reference) formData.append('reference', reference);
    return apiClient.postForm<Order>(`/orders/${orderId}/transfer-proof`, formData);
  },

  async getMyOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>('/orders/me');
  },

  async getById(orderId: string): Promise<Order> {
    return apiClient.get<Order>(`/orders/${orderId}`);
  },

  async getBankTransferInfo(): Promise<BankTransferInfo> {
    return apiClient.get<BankTransferInfo>('/orders/bank-transfer-info');
  },
};
