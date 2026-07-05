import { useState, useEffect, useCallback } from 'react';
import { eventsService } from '../services/eventsService';
import { ApiError } from '../services/apiClient';
import { EventCard } from '../components/EventCard';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import type { Event } from '../types/events';
import './EventsPage.css';

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventsService.getAll({ upcoming: true });
      setEvents(data.filter(e => e.status === 'PUBLISHED'));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudieron cargar los eventos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return <LoadingSpinner text="Cargando eventos..." />;
  }

  return (
    <div className="events-page">
      <div className="events-page__header">
        <h1 className="events-page__title">Eventos INVS</h1>
        <button className="events-page__refresh" onClick={load} title="Refrescar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={load} />}

      {events.length === 0 && !error ? (
        <div className="events-page__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ color: 'var(--color-text-muted)' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p>No hay eventos disponibles.</p>
        </div>
      ) : (
        <div className="events-page__list">
          {events.map((event, i) => (
            <div key={event.id} style={{ animationDelay: `${i * 0.08}s` }}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
