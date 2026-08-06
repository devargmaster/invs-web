import type { ThemePalette } from '../types/theme';

export const THEME_CACHE_KEY = 'invs_theme_cache';

const CSS_VAR_BY_KEY: Record<keyof ThemePalette, string> = {
  colorBg: '--color-bg',
  colorSurface: '--color-surface',
  colorBorder: '--color-border',
  colorAccent: '--color-accent',
  colorAccentHover: '--color-accent-hover',
  colorText: '--color-text',
  colorTextSecondary: '--color-text-secondary',
  colorTextMuted: '--color-text-muted',
  colorSuccess: '--color-success',
  colorDanger: '--color-danger',
};

// Nunca escribe un valor inválido: una paleta parcial o corrupta (cache
// vieja, respuesta inesperada del backend) no debe poder tirar abajo el
// resto del sitio — las claves ausentes simplemente dejan el default de
// :root en index.css en vez de pisarlo con "undefined".
export function applyTheme(palette: Partial<ThemePalette> | null | undefined) {
  if (!palette) return;
  const root = document.documentElement.style;
  for (const key of Object.keys(CSS_VAR_BY_KEY) as (keyof ThemePalette)[]) {
    const value = palette[key];
    if (typeof value === 'string' && value.length > 0) {
      root.setProperty(CSS_VAR_BY_KEY[key], value);
    }
  }
}
