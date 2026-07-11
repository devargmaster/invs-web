import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCheckout } from '../context/CheckoutContext';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { CartSummaryCard } from '../components/CartSummaryCard';
import { formatMoney } from '../utils/formatters';
import type { PaymentMethod } from '../types/checkout';
import './Checkout.css';

export function CheckoutSummaryPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addonItems, subtotalCents, clear } = useCheckout();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD_OPENPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!eventId) return null;

  if (items.length === 0) {
    navigate(`/eventos/${eventId}/checkout`, { replace: true });
    return null;
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await ordersService.create({
        eventId,
        items: items.map((i) => ({ categoryId: i.category.id, quantity: i.quantity })),
        addons: addonItems.map((i) => ({
          addonId: i.addon.id,
          variantId: i.variant?.id,
          quantity: i.quantity,
        })),
        paymentMethod,
      });
      clear();
      navigate(
        paymentMethod === 'CARD_OPENPAY'
          ? `/checkout/pago/${order.id}`
          : `/checkout/transferencia/${order.id}`,
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al crear la orden.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__layout">
        <div className="checkout-page__main">
          <div className="checkout-page__header">
            <span className="checkout-page__step">Paso 3 de 3</span>
            <h1 className="checkout-page__title">Resumen y pago</h1>
          </div>

          {/* Recap de ítems — en desktop ya está en el panel lateral, acá solo para mobile */}
          <div className="checkout-summary-recap-mobile">
            {items.map((i) => (
              <div className="checkout-summary-line" key={i.category.id}>
                <span className="checkout-summary-line__label">{i.quantity}× {i.category.name}</span>
                <span className="checkout-summary-line__value">{formatMoney(i.category.priceCents * i.quantity, i.category.currency)}</span>
              </div>
            ))}
            {addonItems.map((i) => (
              <div className="checkout-summary-line" key={`${i.addon.id}:${i.variant?.id ?? ''}`}>
                <span className="checkout-summary-line__label">
                  {i.quantity}× {i.addon.name}{i.variant ? ` (${i.variant.label})` : ''}
                </span>
                <span className="checkout-summary-line__value">{formatMoney(i.addon.priceCents * i.quantity, i.addon.currency)}</span>
              </div>
            ))}

            <div className="checkout-summary-total">
              <span className="checkout-summary-total__label">Total</span>
              <span className="checkout-summary-total__value">{formatMoney(subtotalCents)}</span>
            </div>
          </div>

          <div style={{ marginTop: 28 }}>
            <span className="checkout-field-label">Método de pago</span>

            <div
              className={`checkout-payment-option ${paymentMethod === 'CARD_OPENPAY' ? 'checkout-payment-option--active' : ''}`}
              onClick={() => setPaymentMethod('CARD_OPENPAY')}
            >
              <div className="checkout-payment-option__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="1" y="4" width="22" height="16" rx="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <div className="checkout-payment-option__label">Tarjeta de crédito/débito</div>
                <div className="checkout-payment-option__sub">Vía Openpay — acreditación inmediata</div>
              </div>
            </div>

            <div
              className={`checkout-payment-option ${paymentMethod === 'BANK_TRANSFER' ? 'checkout-payment-option--active' : ''}`}
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
            >
              <div className="checkout-payment-option__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v3M16 14v3" />
                </svg>
              </div>
              <div>
                <div className="checkout-payment-option__label">Transferencia bancaria</div>
                <div className="checkout-payment-option__sub">Tus entradas quedan pendientes hasta validar el pago</div>
              </div>
            </div>
          </div>

          {error && <ErrorBanner message={error} />}

          {/* Confirmar — en desktop el botón vive en el panel lateral, acá solo para mobile */}
          <div className="checkout-page__mobile-confirm">
            <button className="checkout-btn checkout-btn--primary checkout-btn--block" onClick={handleConfirm} disabled={submitting}>
              {submitting ? <span className="checkout-btn-spinner" /> : 'Confirmar compra'}
            </button>
          </div>
        </div>

        <aside className="checkout-page__sidebar">
          <CartSummaryCard
            title="Resumen"
            continueLabel={submitting ? <span className="checkout-btn-spinner" /> : 'Confirmar compra'}
            onContinue={handleConfirm}
            continueDisabled={submitting}
          />
        </aside>
      </div>
    </div>
  );
}
