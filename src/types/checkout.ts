export interface TicketCategory {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  maxCapacity: number;
  reservedCount: number;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  sortOrder: number;
  isActive: boolean;
}

export interface CategoryAvailability {
  maxCapacity: number;
  reservedCount: number;
  available: number;
}

export interface AddonVariant {
  id: string;
  addonId: string;
  label: string;
  sortOrder: number;
}

export interface AddOn {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  hasVariants: boolean;
  maxStock: number | null;
  reservedStock: number;
  isActive: boolean;
  sortOrder: number;
  variants: AddonVariant[];
}

export type PaymentMethod = 'CARD_OPENPAY' | 'BANK_TRANSFER';
export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'CANCELLED';

export interface OrderAddon {
  id: string;
  orderId: string;
  addonId: string;
  variantId: string | null;
  quantity: number;
  unitPriceCents: number;
  addon?: AddOn;
  variant?: AddonVariant | null;
}

export interface Order {
  id: string;
  buyerId: string;
  eventId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotalCents: number;
  totalCents: number;
  currency: string;
  transferProofUrl: string | null;
  transferReference: string | null;
  rejectionReason: string | null;
  paymentError: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  tickets?: { id: string; categoryId: string; status: string }[];
  addons?: OrderAddon[];
  event?: { id: string; title: string; date: string; location: string | null };
}

// ─── Carrito (estado local, antes de crear la orden) ──────────────
export interface CartItem {
  category: TicketCategory;
  quantity: number;
}

export interface CartAddonItem {
  addon: AddOn;
  variant: AddonVariant | null;
  quantity: number;
}

export interface CreateOrderPayload {
  eventId: string;
  items: { categoryId: string; quantity: number }[];
  addons?: { addonId: string; variantId?: string; quantity: number }[];
  paymentMethod: PaymentMethod;
}
