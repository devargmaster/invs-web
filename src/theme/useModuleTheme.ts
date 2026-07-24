import { useEffect } from 'react';
import { applyTheme } from './applyTheme';
import { getThemePayload } from './themeStore';
import type { ThemeModuleKey } from '../types/theme';

// Aplica la paleta resuelta del módulo mientras el componente está montado
// y revierte a la global al desmontar — mismo patrón que el preview en vivo
// de Appearance.tsx en invs-backoffice. Si ThemeBootstrap todavía no bajó
// /theme (montaje muy temprano), no hace nada y la página se queda con los
// defaults de :root hasta la próxima navegación.
export function useModuleTheme(module: ThemeModuleKey) {
  useEffect(() => {
    const payload = getThemePayload();
    if (!payload) return;
    applyTheme(payload.modules[module]);
    return () => applyTheme(payload);
  }, [module]);
}
