import type { AddOn, PaymentMethod } from './checkout';

export type StoreProduct = AddOn;

export type StorePurchaseStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface StorePurchase {
  id: string;
  userId: string;
  addonId: string;
  variantId: string | null;
  quantity: number;
  status: StorePurchaseStatus;
  paymentMethod: PaymentMethod;
  priceCents: number;
  currency: string;
  transferProofUrl: string | null;
  transferReference: string | null;
  rejectionReason: string | null;
  paymentError: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  addon?: { id: string; name: string; imageUrl: string | null } | null;
  variant?: { id: string; label: string } | null;
}

export interface CreateStorePurchasePayload {
  addonId: string;
  variantId?: string;
  quantity?: number;
  paymentMethod: PaymentMethod;
}
