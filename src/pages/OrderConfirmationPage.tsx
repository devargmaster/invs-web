import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ordersService } from '../services/ordersService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { Order } from '../types/checkout';
import './Checkout.css';

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    ordersService.getById(orderId)
      .then(setOrder)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando la orden.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) return <LoadingSpinner text="Confirmando..." />;

  if (error || !order) {
    return (
      <div className="checkout-page">
        <ErrorBanner message={error ?? 'Orden no encontrada.'} />
      </div>
    );
  }

  const isPaid = order.status === 'PAID';

  return (
    <div className="checkout-page">
      <div className="checkout-confirm">
        <div className={`checkout-confirm__icon ${isPaid ? 'checkout-confirm__icon--success' : 'checkout-confirm__icon--pending'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="44" height="44">
            {isPaid ? <polyline points="20 6 9 17 4 12" /> : (
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            )}
          </svg>
        </div>

        <h1 className="checkout-confirm__title">
          {isPaid ? '¡Compra confirmada!' : 'Comprobante recibido'}
        </h1>
        <p className="checkout-confirm__text">
          {isPaid
            ? 'Ya generamos tus entradas con su código QR. Las vas a encontrar en "Mis Entradas".'
            : 'Tu comprobante quedó pendiente de validación. En cuanto lo confirmemos vas a poder ver tus entradas activas — te avisamos por mail.'}
        </p>

        {!isPaid && (
          <div className="checkout-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2" width="18" height="18" style={{ flex: 'none', marginTop: 2 }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="checkout-note__text">
              Podés seguir el estado de tu pago desde "Mis Entradas" en cualquier momento.
            </span>
          </div>
        )}

        <button
          className="checkout-btn checkout-btn--primary checkout-btn--block"
          style={{ marginTop: 28 }}
          onClick={() => navigate('/entradas')}
        >
          Ver mis entradas
        </button>
      </div>
    </div>
  );
}
