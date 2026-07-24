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

  // MP redirige de vuelta (auto_return) apenas aprueba el pago, antes de
  // que el webhook llegue a confirmar la orden — esto consulta a MP
  // directo con el payment_id que ya viene en la URL, sin depender de
  // que el webhook haya corrido.
  async syncMercadoPago(orderId: string, paymentId: string): Promise<Order> {
    return apiClient.post<Order>(`/orders/${orderId}/sync-mercadopago`, { paymentId });
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
