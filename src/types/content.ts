export interface AvailableAccess {
  /** true si una suscripción activa daría acceso a este contenido. */
  subscription: boolean;
  /** presente si el contenido también se vende suelto, con su precio. */
  purchase: { priceCents: number; currency: string } | null;
}

export interface RecordingWithAccess {
  id: string;
  eventId: string | null;
  title: string;
  description: string | null;
  duration: number | null;
  thumbnailUrl: string | null;
  isFree: boolean;
  includedInSubscription: boolean;
  priceCents: number | null;
  currency: string;
  createdAt: string;
  event?: { id: string; title: string; date: string } | null;
  /** Si el usuario actual ya tiene acceso (gratis, suscripción o compra). */
  granted: boolean;
  availableAccess: AvailableAccess;
}

export type ContentPurchaseStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';
export type PaymentMethod = 'CARD_OPENPAY' | 'BANK_TRANSFER' | 'MERCADOPAGO';

export interface ContentPurchase {
  id: string;
  userId: string;
  recordingId: string | null;
  eventId: string | null;
  status: ContentPurchaseStatus;
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
  recording?: { id: string; title: string; thumbnailUrl: string | null } | null;
  event?: { id: string; title: string } | null;
}

export interface CreateContentPurchasePayload {
  recordingId?: string;
  eventId?: string;
  paymentMethod: PaymentMethod;
}
