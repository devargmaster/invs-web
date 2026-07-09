export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function modeLabel(mode: string): string {
  return mode === 'PRESENCIAL' ? 'Presencial'
    : mode === 'STREAMING' ? 'Streaming'
    : 'Híbrido';
}

/** El backend maneja todos los montos en centavos para evitar problemas de punto flotante. */
export function formatMoney(cents: number, currency = 'ARS'): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency }).format(cents / 100);
}
