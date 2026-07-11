import type { ReactNode } from 'react';
import { useCheckout } from '../context/CheckoutContext';
import { formatMoney } from '../utils/formatters';
import './CartSummaryCard.css';

interface CartSummaryCardProps {
  title?: string;
  /** Texto del botón — puede ser JSX (ej: spinner mientras se envía). */
  continueLabel: ReactNode;
  onContinue: () => void;
  continueDisabled?: boolean;
  /** Contenido extra entre el total y el botón (ej: nota, error). */
  children?: ReactNode;
}

/**
 * Resumen de compra (categorías + adicionales + total) reusado como panel
 * lateral sticky en desktop dentro del flujo de checkout — mismo dato que
 * la barra fija de mobile, pero visible todo el tiempo mientras se navega
 * por la lista, como en Eventbrite/Mundo Ticket.
 */
export function CartSummaryCard({ title = 'Tu compra', continueLabel, onContinue, continueDisabled, children }: CartSummaryCardProps) {
  const { items, addonItems, subtotalCents } = useCheckout();
  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  if (totalTickets === 0) {
    return (
      <div className="cart-summary-card cart-summary-card--empty">
        <span className="cart-summary-card__empty-text">Elegí al menos una entrada para continuar.</span>
      </div>
    );
  }

  return (
    <div className="cart-summary-card">
      <span className="cart-summary-card__title">{title}</span>

      <div className="cart-summary-card__lines">
        {items.map((i) => (
          <div className="cart-summary-card__line" key={i.category.id}>
            <span className="cart-summary-card__line-label">{i.quantity}× {i.category.name}</span>
            <span className="cart-summary-card__line-value">{formatMoney(i.category.priceCents * i.quantity, i.category.currency)}</span>
          </div>
        ))}
        {addonItems.map((i) => (
          <div className="cart-summary-card__line" key={`${i.addon.id}:${i.variant?.id ?? ''}`}>
            <span className="cart-summary-card__line-label">
              {i.quantity}× {i.addon.name}{i.variant ? ` (${i.variant.label})` : ''}
            </span>
            <span className="cart-summary-card__line-value">{formatMoney(i.addon.priceCents * i.quantity, i.addon.currency)}</span>
          </div>
        ))}
      </div>

      <div className="cart-summary-card__total">
        <span>Total</span>
        <span className="cart-summary-card__total-value">{formatMoney(subtotalCents)}</span>
      </div>

      {children}

      <button
        className="checkout-btn checkout-btn--primary checkout-btn--block"
        onClick={onContinue}
        disabled={continueDisabled}
      >
        {continueLabel}
      </button>
    </div>
  );
}
