import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { TicketCategory, AddOn, AddonVariant, CartItem, CartAddonItem } from '../types/checkout';

interface CheckoutContextValue {
  eventId: string | null;
  items: CartItem[];
  addonItems: CartAddonItem[];
  subtotalCents: number;
  startCheckout: (eventId: string) => void;
  setCategoryQuantity: (category: TicketCategory, quantity: number) => void;
  setAddonQuantity: (addon: AddOn, variant: AddonVariant | null, quantity: number) => void;
  clear: () => void;
}

const CheckoutContext = createContext<CheckoutContextValue | null>(null);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [eventId, setEventId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addonItems, setAddonItems] = useState<CartAddonItem[]>([]);

  const startCheckout = useCallback((newEventId: string) => {
    setEventId((prev) => {
      if (prev !== newEventId) {
        // Cambiar de evento reinicia el carrito, no tiene sentido mezclar
        setItems([]);
        setAddonItems([]);
      }
      return newEventId;
    });
  }, []);

  const setCategoryQuantity = useCallback((category: TicketCategory, quantity: number) => {
    setItems((prev) => {
      const rest = prev.filter((i) => i.category.id !== category.id);
      if (quantity <= 0) return rest;
      return [...rest, { category, quantity }];
    });
  }, []);

  const setAddonQuantity = useCallback((addon: AddOn, variant: AddonVariant | null, quantity: number) => {
    setAddonItems((prev) => {
      const key = (i: CartAddonItem) => `${i.addon.id}:${i.variant?.id ?? ''}`;
      const thisKey = `${addon.id}:${variant?.id ?? ''}`;
      const rest = prev.filter((i) => key(i) !== thisKey);
      if (quantity <= 0) return rest;
      return [...rest, { addon, variant, quantity }];
    });
  }, []);

  const clear = useCallback(() => {
    setEventId(null);
    setItems([]);
    setAddonItems([]);
  }, []);

  const subtotalCents = useMemo(() => {
    const categoriesTotal = items.reduce((sum, i) => sum + i.category.priceCents * i.quantity, 0);
    const addonsTotal = addonItems.reduce((sum, i) => sum + i.addon.priceCents * i.quantity, 0);
    return categoriesTotal + addonsTotal;
  }, [items, addonItems]);

  return (
    <CheckoutContext.Provider
      value={{ eventId, items, addonItems, subtotalCents, startCheckout, setCategoryQuantity, setAddonQuantity, clear }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout(): CheckoutContextValue {
  const ctx = useContext(CheckoutContext);
  if (!ctx) throw new Error('useCheckout debe usarse dentro de <CheckoutProvider>');
  return ctx;
}
