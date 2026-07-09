/**
 * Configuración de entorno para INVS Web
 */
export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://invsshowsbackend-production.up.railway.app/api/v1',
  TOKEN_STORAGE_KEY: 'invs_access_token',
  // Clave pública de Openpay Argentina (BBVA) — no es secreta, se usa del
  // lado del cliente para tokenizar la tarjeta. Sin esto configurado, el
  // pago con tarjeta muestra un error claro en vez de fallar en silencio.
  OPENPAY_PUBLIC_KEY: import.meta.env.VITE_OPENPAY_PUBLIC_KEY || '',
};
