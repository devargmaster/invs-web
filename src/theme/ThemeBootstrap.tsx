import { useEffect } from 'react';
import { themeService } from '../services/themeService';
import { applyTheme, THEME_CACHE_KEY } from './applyTheme';

// Montado por encima de <Routes>, así alcanza también /login y
// /transfers/:token (fuera de <Layout>). No renderiza nada. La llamada a
// /theme no requiere auth — apiClient no manda token si no hay uno, y este
// endpoint nunca devuelve 401, así que un visitante anónimo nunca termina
// redirigido a /login por esto.
export function ThemeBootstrap() {
  useEffect(() => {
    themeService
      .get()
      .then((palette) => {
        applyTheme(palette);
        localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(palette));
      })
      .catch(() => {
        // Sin conexión o error puntual: se queda con el default/cache ya aplicado.
      });
  }, []);

  return null;
}
