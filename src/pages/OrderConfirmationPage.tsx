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
  const [retrying, setRetrying] = useState(false);

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
  const isCancelled = order.status === 'CANCELLED';
  // BANK_TRANSFER solo llega acá después de subir el comprobante (ver
  // CheckoutTransferPage) — "pendiente de validación" es preciso ahí. Para
  // MERCADOPAGO/CARD_OPENPAY, este mismo route también es el back_url al
  // que Mercado Pago redirige si el comprador cierra/cancela sin pagar
  // (collection_status=null en la URL) — mostrar el mensaje de "comprobante"
  // en ese caso es directamente falso, nadie subió nada.
  const isAwaitingTransferReview = !isPaid && !isCancelled && order.paymentMethod === 'BANK_TRANSFER';
  const isUnpaidOnlinePayment = !isPaid && !isCancelled && !isAwaitingTransferReview;

  const handleRetryMercadoPago = async () => {
    setRetrying(true);
    try {
      const { redirectUrl } = await ordersService.payMercadoPago(order.id);
      window.location.href = redirectUrl;
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo reintentar el pago.');
      setRetrying(false);
    }
  };

  const iconVariant = isPaid ? 'success' : isCancelled ? 'cancelled' : 'pending';

  const title = isPaid
    ? '¡Compra confirmada!'
    : isCancelled
      ? 'Orden cancelada'
      : isAwaitingTransferReview
        ? 'Comprobante recibido'
        : 'El pago no se completó';

  const text = isPaid
    ? 'Ya generamos tus entradas con su código QR. Las vas a encontrar en "Mis Entradas".'
    : isCancelled
      ? 'Esta orden venció o fue cancelada. Iniciá una compra nueva si todavía querés esas entradas.'
      : isAwaitingTransferReview
        ? 'Tu comprobante quedó pendiente de validación. En cuanto lo confirmemos vas a poder ver tus entradas activas — te avisamos por mail.'
        : 'Todavía no se acreditó el pago — puede ser porque cerraste la ventana antes de terminar o porque se canceló. Tus entradas quedan reservadas hasta que venza el tiempo de la orden; podés reintentar el pago cuando quieras.';

  return (
    <div className="checkout-page">
      <div className="checkout-confirm">
        <div className={`checkout-confirm__icon checkout-confirm__icon--${iconVariant}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="44" height="44">
            {iconVariant === 'success' ? <polyline points="20 6 9 17 4 12" /> : iconVariant === 'cancelled' ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            )}
          </svg>
        </div>

        <h1 className="checkout-confirm__title">{title}</h1>
        <p className="checkout-confirm__text">{text}</p>

        {isAwaitingTransferReview && (
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

        {error && <ErrorBanner message={error} />}

        {isUnpaidOnlinePayment && order.paymentMethod === 'MERCADOPAGO' && (
          <button
            className="checkout-btn checkout-btn--primary checkout-btn--block"
            style={{ marginTop: 28 }}
            onClick={handleRetryMercadoPago}
            disabled={retrying}
          >
            {retrying ? <span className="checkout-btn-spinner" /> : 'Reintentar pago'}
          </button>
        )}

        {isUnpaidOnlinePayment && order.paymentMethod === 'CARD_OPENPAY' && (
          <button
            className="checkout-btn checkout-btn--primary checkout-btn--block"
            style={{ marginTop: 28 }}
            onClick={() => navigate(`/checkout/pago/${order.id}`)}
          >
            Reintentar pago
          </button>
        )}

        <button
          className="checkout-btn checkout-btn--block"
          style={{ marginTop: isUnpaidOnlinePayment ? 12 : 28 }}
          onClick={() => navigate('/entradas')}
        >
          Ver mis entradas
        </button>
      </div>
    </div>
  );
}
