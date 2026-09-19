import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../services/storeService';
import { ApiError } from '../services/apiClient';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { ProductCard } from '../components/ProductCard';
import type { StoreProduct } from '../types/store';
import type { AddonVariant } from '../types/checkout';
import './Checkout.css';

interface TiendaCheckoutState {
  addonId: string;
  variantId?: string;
  quantity: number;
  name: string;
  priceCents: number; // total = precio unitario * quantity
  currency: string;
}

export function TiendaPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, AddonVariant>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState<'TODOS' | 'PRODUCTO' | 'SERVICIO'>('TODOS');

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    storeService.getProducts()
      .then(setProducts)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando la Tienda.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleBuy = (product: StoreProduct, variant: AddonVariant | null, quantity: number) => {
    const state: TiendaCheckoutState = {
      addonId: product.id,
      variantId: variant?.id,
      quantity,
      name: product.name,
      priceCents: product.priceCents * quantity,
      currency: product.currency,
    };
    navigate('/tienda/comprar', { state });
  };

  if (loading) return <LoadingSpinner text="Cargando la Tienda..." />;

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
            <span className="checkout-page__step">Tienda</span>
            <h1 className="checkout-page__title">Productos y servicios</h1>
            <p className="checkout-page__subtitle">Comprá productos o contrată servicios sueltos, sin necesidad de una entrada.</p>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {(['TODOS', 'PRODUCTO', 'SERVICIO'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCategoryTab(tab)}
                className={`checkout-btn ${categoryTab === tab ? 'checkout-btn--primary' : ''}`}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                {tab === 'TODOS' ? 'Todos' : tab === 'PRODUCTO' ? 'Productos' : 'Servicios'}
              </button>
            ))}
          </div>

          {(() => {
            const visibleProducts = categoryTab === 'TODOS' ? products : products.filter((p) => p.category === categoryTab);
            if (visibleProducts.length === 0) {
              return <div className="checkout-empty">Todavía no hay {categoryTab === 'SERVICIO' ? 'servicios' : categoryTab === 'PRODUCTO' ? 'productos' : 'nada'} en la Tienda.</div>;
            }
            return visibleProducts.map((product) => {
              const variant = product.hasVariants ? selectedVariant[product.id] ?? product.variants[0] : null;
              const qty = quantities[product.id] ?? 0;
              return (
                <div key={product.id} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ProductCard
                    addon={product}
                    variant={variant}
                    onSelectVariant={(v) => setSelectedVariant((prev) => ({ ...prev, [product.id]: v }))}
                    quantity={qty}
                    onQuantityChange={(newQty) => setQuantities((prev) => ({ ...prev, [product.id]: newQty }))}
                  />
                  {qty > 0 && (
                    <button
                      className="checkout-btn checkout-btn--primary"
                      style={{ alignSelf: 'flex-end' }}
                      onClick={() => handleBuy(product, variant, qty)}
                    >
                      Comprar
                    </button>
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
}
