import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categoriesService } from '../services/categoriesService';
import { addonsService } from '../services/addonsService';
import { ApiError } from '../services/apiClient';
import { useCheckout } from '../context/CheckoutContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { CartSummaryCard } from '../components/CartSummaryCard';
import { formatMoney } from '../utils/formatters';
import type { TicketCategory } from '../types/checkout';
import './Checkout.css';

export function CheckoutCategoriesPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, setCategoryQuantity, startCheckout, subtotalCents } = useCheckout();

  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [hasAddons, setHasAddons] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      categoriesService.getByEvent(eventId),
      addonsService.getByEvent(eventId).catch(() => []),
    ])
      .then(([cats, addons]) => {
        setCategories(cats);
        setHasAddons(addons.length > 0);
        startCheckout(eventId);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando categorías.'))
      .finally(() => setLoading(false));
  }, [eventId, startCheckout]);

  useEffect(() => { load(); }, [load]);

  const quantityOf = (categoryId: string) => items.find((i) => i.category.id === categoryId)?.quantity ?? 0;

  const totalTickets = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleContinue = () => {
    if (!eventId) return;
    navigate(hasAddons ? `/eventos/${eventId}/checkout/adicionales` : `/eventos/${eventId}/checkout/resumen`);
  };

  if (loading) return <LoadingSpinner text="Cargando categorías..." />;

  if (error) {
    return (
      <div className="checkout-page">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">Este evento todavía no tiene categorías de entrada configuradas.</div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__layout">
        <div className="checkout-page__main">
          <div className="checkout-page__header">
            <span className="checkout-page__step">Paso 1 de {hasAddons ? '3' : '2'}</span>
            <h1 className="checkout-page__title">Elegí tus entradas</h1>
            <p className="checkout-page__subtitle">Podés combinar varias categorías en la misma compra.</p>
          </div>

          {categories.map((cat) => {
            const available = cat.maxCapacity - cat.reservedCount;
            const qty = quantityOf(cat.id);
            const atMax = qty >= available;
            return (
              <div className="checkout-item" key={cat.id}>
                <div className="checkout-item__info">
                  <div className="checkout-item__name">{cat.name}</div>
                  {cat.description && <div className="checkout-item__desc">{cat.description}</div>}
                  {cat.accessStartsAt && (
                    <div className="checkout-item__meta">
                      Ingreso: {new Date(cat.accessStartsAt).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                  <div className="checkout-item__price">{formatMoney(cat.priceCents, cat.currency)}</div>
                  <div className={`checkout-item__available ${available <= 0 ? 'checkout-item__available--none' : available <= 5 ? 'checkout-item__available--low' : ''}`}>
                    {available <= 0 ? 'Sin cupo disponible' : `${available} disponibles`}
                  </div>
                </div>
                <div className="checkout-stepper">
                  <button
                    className="checkout-stepper__btn"
                    onClick={() => setCategoryQuantity(cat, Math.max(0, qty - 1))}
                    disabled={qty === 0}
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <span className="checkout-stepper__count">{qty}</span>
                  <button
                    className="checkout-stepper__btn"
                    onClick={() => setCategoryQuantity(cat, qty + 1)}
                    disabled={atMax}
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de resumen — sticky en desktop, oculto en mobile (ahí se usa la barra fija de abajo) */}
        <aside className="checkout-page__sidebar">
          <CartSummaryCard continueLabel="Continuar" onContinue={handleContinue} />
        </aside>
      </div>

      {totalTickets > 0 && (
        <div className="checkout-page__footer">
          <div className="checkout-page__footer-total">
            <span className="checkout-page__footer-total-label">{totalTickets} entrada{totalTickets !== 1 ? 's' : ''}</span>
            <span className="checkout-page__footer-total-value">{formatMoney(subtotalCents)}</span>
          </div>
          <button className="checkout-btn checkout-btn--primary" onClick={handleContinue}>
            Continuar
          </button>
        </div>
      )}
    </div>
  );
}
