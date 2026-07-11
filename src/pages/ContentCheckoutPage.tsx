import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentPurchasesService } from '../services/contentPurchasesService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatMoney } from '../utils/formatters';
import type { PaymentMethod } from '../types/content';
import './Checkout.css';

interface ContentCheckoutState {
  type: 'recording' | 'event';
  id: string;
  title: string;
  priceCents: number;
  currency: string;
}

export function ContentCheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ContentCheckoutState | null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD_OPENPAY');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state) navigate('/streaming', { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const purchase = await contentPurchasesService.create({
        recordingId: state.type === 'recording' ? state.id : undefined,
        eventId: state.type === 'event' ? state.id : undefined,
        paymentMethod,
      });
      navigate(
        paymentMethod === 'CARD_OPENPAY'
          ? `/streaming/pago/${purchase.id}`
          : `/streaming/transferencia/${purchase.id}`,
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
        <span className="checkout-page__step">Comprar contenido</span>
        <h1 className="checkout-page__title">{state.title}</h1>
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
            <div className="checkout-payment-option__sub">El acceso queda pendiente hasta validar el pago</div>
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
        {submitting ? <span className="checkout-btn-spinner" /> : 'Confirmar compra'}
      </button>
    </div>
  );
}
