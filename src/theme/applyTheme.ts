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

export function applyTheme(palette: ThemePalette) {
  const root = document.documentElement.style;
  for (const key of Object.keys(CSS_VAR_BY_KEY) as (keyof ThemePalette)[]) {
    root.setProperty(CSS_VAR_BY_KEY[key], palette[key]);
  }
}
