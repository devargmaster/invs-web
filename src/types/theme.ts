export interface ThemePalette {
  colorBg: string;
  colorSurface: string;
  colorBorder: string;
  colorAccent: string;
  colorAccentHover: string;
  colorText: string;
  colorTextSecondary: string;
  colorTextMuted: string;
  colorSuccess: string;
  colorDanger: string;
}

// Módulos con paleta propia (ver ThemeModuleOverride en invs-backend) — ya
// resueltos contra el global, así este cliente nunca hace el merge.
export type ThemeModuleKey = 'EVENTS' | 'STREAMING';

export interface ThemePublicPayload extends ThemePalette {
  modules: Record<ThemeModuleKey, ThemePalette>;
}
