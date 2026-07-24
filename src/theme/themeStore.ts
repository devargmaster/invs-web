import type { ThemePublicPayload } from '../types/theme';

// Cache en memoria del último payload de /theme (global + módulos ya
// resueltos), poblado por ThemeBootstrap. Evita que cada página con
// useModuleTheme tenga que pedir /theme de nuevo.
let current: ThemePublicPayload | null = null;

export function setThemePayload(payload: ThemePublicPayload) {
  current = payload;
}

export function getThemePayload(): ThemePublicPayload | null {
  return current;
}
