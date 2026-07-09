import { ENV } from '../config/env';

export interface CardInput {
  cardNumber: string;
  holderName: string;
  expirationMonth: string;
  expirationYear: string;
  cvv2: string;
}

export interface TokenizeResult {
  cardToken: string;
  deviceSessionId: string;
}

/**
 * Tokeniza la tarjeta con el SDK de Openpay Argentina (BBVA) del lado del
 * cliente — el número de tarjeta NUNCA debe llegar al backend, solo el
 * token resultante.
 *
 * TODO: falta conectar el SDK real de Openpay (docs.ecommercebbva.com)
 * cuando exista la cuenta/credenciales — hoy no hay cuenta creada
 * (confirmado con el usuario), así que esto falla explícitamente en vez
 * de simular un pago falso. El formulario y el resto del flujo ya están
 * listos: cuando haya SDK, esta función es el único lugar a completar.
 */
export async function tokenizeCard(_card: CardInput): Promise<TokenizeResult> {
  if (!ENV.OPENPAY_PUBLIC_KEY) {
    throw new Error(
      'El pago con tarjeta todavía no está habilitado (falta configurar Openpay). Probá pagar por transferencia mientras tanto.',
    );
  }
  throw new Error('Integración de Openpay pendiente de completar del lado del cliente.');
}
