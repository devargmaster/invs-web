import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { contentPurchasesService } from '../services/contentPurchasesService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { ContentPurchase } from '../types/content';
import './Checkout.css';

export function ContentPurchaseConfirmationPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [purchase, setPurchase] = useState<ContentPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!purchaseId) return;
    // Ver el comentario equivalente en OrderConfirmationPage.tsx — Mercado
    // Pago redirige acá apenas aprueba, antes de que su webhook confirme
    // la compra. Si vino con payment_id, consultamos a MP directo.
    const paymentId = searchParams.get('payment_id');
    const request = paymentId
      ? contentPurchasesService.syncMercadoPago(purchaseId, paymentId)
      : contentPurchasesService.getById(purchaseId);
    request
      .then(setPurchase)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando la compra.'))
      .finally(() => setLoading(false));
  }, [purchaseId]);

  if (loading) return <LoadingSpinner text="Confirmando..." />;

  if (error || !purchase) {
    return (
      <div className="checkout-page checkout-page--narrow">
        <ErrorBanner message={error ?? 'Compra no encontrada.'} />
      </div>
    );
  }

  const contentTitle = purchase.recording?.title ?? purchase.event?.title ?? 'este contenido';
  const isPaid = purchase.status === 'PAID';
  const isCancelled = purchase.status === 'CANCELLED';
  const isAwaitingTransferReview = !isPaid && !isCancelled && purchase.paymentMethod === 'BANK_TRANSFER';
  const isUnpaidOnlinePayment = !isPaid && !isCancelled && !isAwaitingTransferReview;

  const handleRetryMercadoPago = async () => {
    setRetrying(true);
    try {
      const { redirectUrl } = await contentPurchasesService.payMercadoPago(purchase.id);
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
      ? 'Compra cancelada'
      : isAwaitingTransferReview
        ? 'Comprobante recibido'
        : 'El pago no se completó';

  const text = isPaid
    ? `Ya podés ver "${contentTitle}" desde la sección Streaming.`
    : isCancelled
      ? 'Esta compra venció o fue cancelada. Iniciá una compra nueva si todavía te interesa.'
      : isAwaitingTransferReview
        ? `Tu comprobante para "${contentTitle}" quedó pendiente de validación — te avisamos por mail apenas lo confirmemos.`
        : 'Todavía no se acreditó el pago — puede ser porque cerraste la ventana antes de terminar o porque se canceló. Podés reintentarlo cuando quieras.';

  return (
    <div className="checkout-page checkout-page--narrow">
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

        {error && <ErrorBanner message={error} />}

        {isUnpaidOnlinePayment && purchase.paymentMethod === 'MERCADOPAGO' && (
          <button
            className="checkout-btn checkout-btn--primary checkout-btn--block"
            style={{ marginTop: 28 }}
            onClick={handleRetryMercadoPago}
            disabled={retrying}
          >
            {retrying ? <span className="checkout-btn-spinner" /> : 'Reintentar pago'}
          </button>
        )}

        {isUnpaidOnlinePayment && purchase.paymentMethod === 'CARD_OPENPAY' && (
          <button
            className="checkout-btn checkout-btn--primary checkout-btn--block"
            style={{ marginTop: 28 }}
            onClick={() => navigate(`/streaming/pago/${purchase.id}`)}
          >
            Reintentar pago
          </button>
        )}

        <button
          className="checkout-btn checkout-btn--block"
          style={{ marginTop: isUnpaidOnlinePayment ? 12 : 28 }}
          onClick={() => navigate('/streaming')}
        >
          Volver a Streaming
        </button>
      </div>
    </div>
  );
}
