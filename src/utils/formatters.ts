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
