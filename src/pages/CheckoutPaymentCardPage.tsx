import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../services/ordersService';
import { tokenizeCard } from '../services/openpayClient';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { ENV } from '../config/env';
import './Checkout.css';

export function CheckoutPaymentCardPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [cardNumber, setCardNumber] = useState('');
  const [holderName, setHolderName] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvv, setCvv] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!orderId) return null;

  const handlePay = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const { cardToken, deviceSessionId } = await tokenizeCard({
        cardNumber,
        holderName,
        expirationMonth: expMonth,
        expirationYear: expYear,
        cvv2: cvv,
      });
      await ordersService.payCard(orderId, cardToken, deviceSessionId);
      navigate(`/checkout/confirmacion/${orderId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : e instanceof Error ? e.message : 'Error al procesar el pago.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-page__header">
        <span className="checkout-page__step">Pago con tarjeta</span>
        <h1 className="checkout-page__title">Datos de tu tarjeta</h1>
      </div>

      {!ENV.OPENPAY_PUBLIC_KEY && (
        <ErrorBanner message="El pago con tarjeta todavía no está habilitado en este ambiente. Volvé atrás y elegí transferencia bancaria." />
      )}

      <label className="checkout-field-label">Número de tarjeta</label>
      <input
        className="checkout-input"
        inputMode="numeric"
        placeholder="4111 1111 1111 1111"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />

      <label className="checkout-field-label">Nombre del titular</label>
      <input
        className="checkout-input"
        placeholder="Como figura en la tarjeta"
        value={holderName}
        onChange={(e) => setHolderName(e.target.value)}
      />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <label className="checkout-field-label">Mes</label>
          <input className="checkout-input" placeholder="MM" maxLength={2} value={expMonth} onChange={(e) => setExpMonth(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="checkout-field-label">Año</label>
          <input className="checkout-input" placeholder="AA" maxLength={2} value={expYear} onChange={(e) => setExpYear(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="checkout-field-label">CVV</label>
          <input className="checkout-input" inputMode="numeric" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <button
        className="checkout-btn checkout-btn--primary checkout-btn--block"
        onClick={handlePay}
        disabled={submitting || !cardNumber || !holderName || !expMonth || !expYear || !cvv}
        style={{ marginTop: 12 }}
      >
        {submitting ? <span className="checkout-btn-spinner" /> : 'Pagar ahora'}
      </button>
    </div>
  );
}
