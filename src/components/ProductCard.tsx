import type { AddOn, AddonVariant } from '../types/checkout';
import { formatMoney } from '../utils/formatters';

interface ProductCardProps {
  addon: AddOn;
  variant: AddonVariant | null;
  onSelectVariant: (variant: AddonVariant) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

/**
 * Card de producto compartida entre CheckoutAddonsPage (complemento de una
 * Experiencia) y TiendaPage (compra standalone) — mismo componente, cada
 * contexto controla su propio estado de variante/cantidad seleccionada.
 */
export function ProductCard({ addon, variant, onSelectVariant, quantity, onQuantityChange }: ProductCardProps) {
  return (
    <div className="checkout-item">
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
                onClick={() => onSelectVariant(v)}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {quantity === 0 ? (
        <button className="checkout-add-btn" onClick={() => onQuantityChange(1)}>
          Agregar
        </button>
      ) : (
        <div className="checkout-stepper">
          <button className="checkout-stepper__btn" onClick={() => onQuantityChange(Math.max(0, quantity - 1))} aria-label="Restar">
            −
          </button>
          <span className="checkout-stepper__count">{quantity}</span>
          <button className="checkout-stepper__btn" onClick={() => onQuantityChange(quantity + 1)} aria-label="Sumar">
            +
          </button>
        </div>
      )}
    </div>
  );
}
