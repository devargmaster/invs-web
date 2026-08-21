import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { PaymentMethod } from '../types/checkout';
import './Checkout.css';

interface TiendaCheckoutState {
  addonId: string;
  variantId?: string;
  quantity: number;
  name: string;
  priceCents: number;
  currency: string;
}

export function TiendaCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as TiendaCheckoutState | null;
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD_OPENPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) navigate('/tienda', { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  if (user && user.role !== 'USER') {
    return (
      <div className="checkout-page checkout-page--narrow">
        <div className="checkout-empty">
          Esta es una cuenta de staff/admin — no puede comprar en la Tienda. Iniciá sesión con tu cuenta personal.
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const purchase = await storeService.create({
        addonId: state.addonId,
        variantId: state.variantId,
        quantity: state.quantity,
        paymentMethod,
      });
      if (paymentMethod === 'MERCADOPAGO') {
        const { redirectUrl } = await storeService.payMercadoPago(purchase.id);
        window.location.href = redirectUrl; // redirect real: nos vamos del sitio a Mercado Pago
        return;
      }

      navigate(
        paymentMethod === 'CARD_OPENPAY'
          ? `/tienda/pago/${purchase.id}`
          : `/tienda/transferencia/${purchase.id}`,
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error al iniciar la compra.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page checkout-page--narrow">
      <div className="checkout-page__header">
        <span className="checkout-page__step">Comprar en la Tienda</span>
        <h1 className="checkout-page__title">{state.name}{state.quantity > 1 ? ` ×${state.quantity}` : ''}</h1>
      </div>

      <div className="checkout-summary-total">
        <span className="checkout-summary-total__label">Precio</span>
        <span className="checkout-summary-total__value">{formatMoney(state.priceCents, state.currency)}</span>
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
            <div className="checkout-payment-option__sub">Tu compra queda pendiente hasta validar el pago</div>
          </div>
        </div>

        <div
          className={`checkout-payment-option ${paymentMethod === 'MERCADOPAGO' ? 'checkout-payment-option--active' : ''}`}
          onClick={() => setPaymentMethod('MERCADOPAGO')}
        >
          <div className="checkout-payment-option__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <div>
            <div className="checkout-payment-option__label">Mercado Pago</div>
            <div className="checkout-payment-option__sub">Te redirigimos a Mercado Pago para pagar</div>
          </div>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        className="checkout-btn checkout-btn--primary checkout-btn--block"
        onClick={handleConfirm}
        disabled={submitting}
        style={{ marginTop: 20 }}
      >
        {submitting ? <span className="btn-spinner" /> : 'Confirmar compra'}
      </button>
    </div>
  );
}
