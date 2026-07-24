import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addonsService } from '../services/addonsService';
import { ApiError } from '../services/apiClient';
import { useCheckout } from '../context/CheckoutContext';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { CartSummaryCard } from '../components/CartSummaryCard';
import { formatMoney } from '../utils/formatters';
import type { AddOn, AddonVariant } from '../types/checkout';
import './Checkout.css';

export function CheckoutAddonsPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addonItems, setAddonQuantity, subtotalCents } = useCheckout();

  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, AddonVariant>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!eventId) return;
    setLoading(true);
    setError(null);
    addonsService.getByEvent(eventId)
      .then(setAddons)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando adicionales.'))
      .finally(() => setLoading(false));
  }, [eventId]);

  useEffect(() => { load(); }, [load]);

  // Si no eligieron entradas, no tiene sentido estar en este paso
  useEffect(() => {
    if (!loading && items.length === 0 && eventId) {
      navigate(`/eventos/${eventId}/checkout`, { replace: true });
    }
  }, [loading, items, eventId, navigate]);

  const quantityOf = (addon: AddOn, variant: AddonVariant | null) =>
    addonItems.find((i) => i.addon.id === addon.id && (i.variant?.id ?? null) === (variant?.id ?? null))?.quantity ?? 0;

  const totalAddons = addonItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleContinue = () => {
    if (!eventId) return;
    navigate(`/eventos/${eventId}/checkout/resumen`);
  };

  if (loading) return <LoadingSpinner text="Cargando adicionales..." />;

  if (error) {
    return (
      <div className="checkout-page">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-page__layout">
        <div className="checkout-page__main">
          <div className="checkout-page__header">
            <span className="checkout-page__step">Paso 2 de 3</span>
            <h1 className="checkout-page__title">Sumá adicionales</h1>
            <p className="checkout-page__subtitle">Decorá tu experiencia — es opcional, podés continuar sin elegir nada.</p>
          </div>

          {addons.length === 0 ? (
            <div className="checkout-empty">Este evento no tiene adicionales configurados.</div>
          ) : (
            addons.map((addon) => {
              const variant = addon.hasVariants ? selectedVariant[addon.id] ?? addon.variants[0] : null;
              const qty = quantityOf(addon, variant);
              return (
                <div className="checkout-item" key={addon.id}>
                  {addon.imageUrl && (
                    <img className="checkout-item__image" src={addon.imageUrl} alt={addon.name} />
                  )}
                  <div className="checkout-item__info">
                    <div className="checkout-item__name">{addon.name}</div>
                    {addon.description && <div className="checkout-item__desc">{addon.description}</div>}
                    <div className="checkout-item__price">{formatMoney(addon.priceCents, addon.currency)}</div>

                    {addon.hasVariants && addon.variants.length > 0 && (
                      <div className="checkout-variants">
                        {addon.variants.map((v) => (
                          <button
                            key={v.id}
                            className={`checkout-variant-chip ${variant?.id === v.id ? 'checkout-variant-chip--active' : ''}`}
                            onClick={() => setSelectedVariant((prev) => ({ ...prev, [addon.id]: v }))}
                          >
                            {v.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {qty === 0 ? (
                    <button
                      className="checkout-add-btn"
                      onClick={() => setAddonQuantity(addon, variant ?? null, 1)}
                    >
                      Agregar
                    </button>
                  ) : (
                    <div className="checkout-stepper">
                      <button
                        className="checkout-stepper__btn"
                        onClick={() => setAddonQuantity(addon, variant ?? null, Math.max(0, qty - 1))}
                        aria-label="Restar"
                      >
                        −
                      </button>
                      <span className="checkout-stepper__count">{qty}</span>
                      <button
                        className="checkout-stepper__btn"
                        onClick={() => setAddonQuantity(addon, variant ?? null, qty + 1)}
                        aria-label="Sumar"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <aside className="checkout-page__sidebar">
          <CartSummaryCard continueLabel="Continuar" onContinue={handleContinue} />
        </aside>
      </div>

      <div className="checkout-page__footer">
        <div className="checkout-page__footer-total">
          <span className="checkout-page__footer-total-label">
            {totalAddons > 0 ? `${totalAddons} adicional(es)` : 'Total'}
          </span>
          <span className="checkout-page__footer-total-value">{formatMoney(subtotalCents)}</span>
        </div>
        <button className="checkout-btn checkout-btn--primary" onClick={handleContinue}>
          Continuar
        </button>
      </div>
    </div>
  );
}
