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

/** Precio de una categoría de entrada: si es $0 no tiene sentido mostrar
 * "$0,00" como si fuera un valor — es acceso gratuito para quien tiene
 * cuenta INVS (ej. categorías de prensa/acreditación). */
export function formatTicketPrice(cents: number, currency = 'ARS'): string {
  return cents === 0 ? 'Acceso sin cargo para miembros registrados INVS' : formatMoney(cents, currency);
}

/** Misma idea que formatTicketPrice pero para espacios angostos de una
 * sola línea (ej. el valor de una fila del resumen del carrito). */
export function formatTicketPriceShort(cents: number, currency = 'ARS'): string {
  return cents === 0 ? 'Sin cargo' : formatMoney(cents, currency);
}
