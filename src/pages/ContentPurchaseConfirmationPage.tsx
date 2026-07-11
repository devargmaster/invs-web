import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contentPurchasesService } from '../services/contentPurchasesService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import type { ContentPurchase } from '../types/content';
import './Checkout.css';

export function ContentPurchaseConfirmationPage() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();

  const [purchase, setPurchase] = useState<ContentPurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!purchaseId) return;
    contentPurchasesService.getById(purchaseId)
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

  const isPaid = purchase.status === 'PAID';
  const contentTitle = purchase.recording?.title ?? purchase.event?.title ?? 'este contenido';

  return (
    <div className="checkout-page checkout-page--narrow">
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
            ? `Ya podés ver "${contentTitle}" desde la sección Streaming.`
            : `Tu comprobante para "${contentTitle}" quedó pendiente de validación — te avisamos por mail apenas lo confirmemos.`}
        </p>

        <button
          className="checkout-btn checkout-btn--primary checkout-btn--block"
          style={{ marginTop: 28 }}
          onClick={() => navigate('/streaming')}
        >
          Volver a Streaming
        </button>
      </div>
    </div>
  );
}
