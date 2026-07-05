/**
 * Configuración de entorno para INVS Web
 */
export const ENV = {
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://invsshowsbackend-production.up.railway.app/api/v1',
  TOKEN_STORAGE_KEY: 'invs_access_token',
};
