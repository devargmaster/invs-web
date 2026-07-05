import { useState, useEffect, useCallback } from 'react';
import { ticketsService } from '../services/ticketsService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { QRDisplay } from '../components/QRDisplay';
import { formatDate } from '../utils/formatters';
import type { Ticket } from '../types/tickets';
import './TicketsPage.css';

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Ticket | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await ticketsService.getMyTickets();
      setTickets(data);
      setSelected((prev) => {
        if (data.length === 0) return null;
        if (!prev) return data[0];
        const prevInData = data.find(t => t.id === prev.id);
        if (!prevInData) return data[0];
        if (!data[0].used && prev.used) return data[0];
        return prevInData;
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Error cargando tickets.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <LoadingSpinner text="Cargando entradas..." />;
  }

  if (error) {
    return (
      <div className="tickets-page">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="tickets-page tickets-page--empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64" style={{ color: 'var(--color-border)' }}>
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
          <path d="M13 5v2" />
          <path d="M13 17v2" />
          <path d="M13 11v2" />
        </svg>
        <p className="tickets-page__empty-text">No tenés entradas activas.</p>
        <p className="tickets-page__empty-note">Comprá un ticket desde el detalle de un evento presencial.</p>
      </div>
    );
  }

  return (
    <div className="tickets-page">
      <h1 className="tickets-page__title">Mis Entradas</h1>

      {/* Ticket selector tabs */}
      {tickets.length > 1 && (
        <div className="tickets-page__tabs">
          {tickets.map(t => (
            <button
              key={t.id}
              className={`tickets-page__tab ${selected?.id === t.id ? 'tickets-page__tab--active' : ''}`}
              onClick={() => setSelected(t)}
            >
              {t.event?.title ?? t.eventId}
              {t.used ? ' (Usada)' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Selected ticket detail */}
      {selected && (
        <div className="tickets-page__detail">
          {selected.event && (
            <div className="tickets-page__event-card">
              <img
                src={`https://picsum.photos/seed/${selected.event.id}/400/200`}
                alt={selected.event.title}
                className="tickets-page__event-img"
                loading="lazy"
              />
              <div className="tickets-page__event-info">
                <h3 className="tickets-page__event-title">{selected.event.title}</h3>
                <p className="tickets-page__event-meta">{formatDate(selected.event.date)}</p>
                {selected.event.location && (
                  <p className="tickets-page__event-meta">📍 {selected.event.location}</p>
                )}
              </div>
            </div>
          )}

          <QRDisplay
            qrPayload={selected.qrPayload}
            used={selected.used}
            usedAt={selected.usedAt}
            expiresAt={selected.expiresAt}
          />
        </div>
      )}
    </div>
  );
}
