import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsService } from '../services/eventsService';
import { ticketsService } from '../services/ticketsService';
import { streamingService } from '../services/streamingService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StreamPlayer } from '../components/StreamPlayer';
import { formatDate, modeLabel, formatMoney } from '../utils/formatters';
import type { Event } from '../types/events';
import type { StreamingTokenResponse, RecordingTokenResponse } from '../types/streaming';
import type { RecordingWithAccess, AvailableAccess } from '../types/content';
import './EventDetailPage.css';

/** Arma un mensaje + ruta de compra a partir del `availableAccess` que
 * manda el backend en el 403 — reemplaza el viejo mensaje fijo de
 * "necesitás suscripción" (ya no es la única razón posible). */
function describeAccessDenial(availableAccess: AvailableAccess | undefined): { message: string; canBuy: boolean } {
  if (!availableAccess) return { message: 'No tenés acceso a este contenido.', canBuy: false };
  const parts: string[] = [];
  if (availableAccess.subscription) parts.push('suscribirte');
  if (availableAccess.purchase) parts.push(`comprarlo por ${formatMoney(availableAccess.purchase.priceCents, availableAccess.purchase.currency)}`);
  if (parts.length === 0) return { message: 'Este contenido no está disponible por el momento.', canBuy: false };
  return { message: `Para acceder podés ${parts.join(' o ')}.`, canBuy: !!availableAccess.purchase };
}

export function EventDetailPage() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recordings, setRecordings] = useState<RecordingWithAccess[]>([]);
  const [streamLoading, setStreamLoading] = useState(false);
  const [streamData, setStreamData] = useState<StreamingTokenResponse | RecordingTokenResponse | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [streamBuyOption, setStreamBuyOption] = useState<{ type: 'recording' | 'event'; id: string; title: string; priceCents: number; currency: string } | null>(null);

  const [hasTicket, setHasTicket] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    eventsService.getById(eventId)
      .then(setEvent)
      .catch(e => setError(e instanceof ApiError ? e.message : 'Error cargando evento.'))
      .finally(() => setLoading(false));

    ticketsService.getTicketsForEvent(eventId)
      .then(tickets => setHasTicket(tickets.length > 0))
      .catch(() => setHasTicket(false));
  }, [eventId]);

  useEffect(() => {
    if (!event || !eventId) return;
    const canWatch = event.mode === 'STREAMING' || event.mode === 'HIBRIDO';
    if (canWatch && !event.isLive) {
      streamingService.getRecordingsByEvent(eventId)
        .then(setRecordings)
        .catch(() => setRecordings([]));
    }
  }, [event, eventId]);

  const handleWatchLive = async () => {
    if (!eventId || !event) return;
    setStreamLoading(true);
    setStreamError(null);
    setStreamBuyOption(null);
    try {
      const data = await streamingService.getLiveToken(eventId);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        const availableAccess = (e.body as { availableAccess?: AvailableAccess })?.availableAccess;
        const { message, canBuy } = describeAccessDenial(availableAccess);
        setStreamError(message);
        if (canBuy && availableAccess?.purchase) {
          setStreamBuyOption({
            type: 'event', id: eventId, title: event.title,
            priceCents: availableAccess.purchase.priceCents, currency: availableAccess.purchase.currency,
          });
        }
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener el stream.');
      }
    } finally {
      setStreamLoading(false);
    }
  };

  const handleWatchRecording = async (recording: RecordingWithAccess) => {
    setStreamLoading(true);
    setStreamError(null);
    setStreamBuyOption(null);
    try {
      const data = await streamingService.getRecordingToken(recording.id);
      setStreamData(data);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 403) {
        const availableAccess = (e.body as { availableAccess?: AvailableAccess })?.availableAccess;
        const { message, canBuy } = describeAccessDenial(availableAccess);
        setStreamError(message);
        if (canBuy && availableAccess?.purchase) {
          setStreamBuyOption({
            type: 'recording', id: recording.id, title: recording.title,
            priceCents: availableAccess.purchase.priceCents, currency: availableAccess.purchase.currency,
          });
        }
      } else {
        setStreamError(e instanceof ApiError ? e.message : 'Error al obtener la grabación.');
      }
    } finally {
      setStreamLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Cargando evento..." />;
  }

  if (error && !event) {
    return (
      <div className="detail-page">
        <ErrorBanner message={error ?? 'Evento no encontrado.'} />
        <button className="detail-page__back" onClick={() => navigate(-1)}>
          ← Volver
        </button>
      </div>
    );
  }

  if (!event) return null;

  const canWatch = event.mode === 'STREAMING' || event.mode === 'HIBRIDO';
  const canGetTicket = event.mode === 'PRESENCIAL' || event.mode === 'HIBRIDO';

  return (
    <div className="detail-page">
      {/* Back button */}
      <button className="detail-page__back" onClick={() => navigate(-1)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <div className="detail-page__layout">
        <div className="detail-page__main">
          {/* Hero image */}
          <div className="detail-page__hero">
            <img
              src={`https://picsum.photos/seed/${event.id}/800/400`}
              alt={event.title}
              className="detail-page__hero-img"
            />
            {event.isLive && (
              <span className="detail-page__live-badge">
                <span className="detail-page__live-dot"></span>
                EN VIVO AHORA
              </span>
            )}
          </div>

          {/* Event info */}
          <div className="detail-page__info">
            <h1 className="detail-page__title">{event.title}</h1>
            <p className="detail-page__meta">{formatDate(event.date)}</p>
            {event.location && <p className="detail-page__meta">📍 {event.location}</p>}
            <span className="detail-page__badge">{modeLabel(event.mode)}</span>
          </div>

          <p className="detail-page__description">{event.description}</p>

          {error && <ErrorBanner message={error} />}

          {/* Streaming section */}
          {canWatch && (
            <div className="detail-page__section">
              {streamData ? (
                <StreamPlayer
                  playbackUrl={(streamData as StreamingTokenResponse).playbackUrl || (streamData as StreamingTokenResponse).hlsUrl || ''}
                  providerType={(streamData as StreamingTokenResponse).providerType}
                  type={event.isLive ? 'live' : 'replay'}
                  title={event.title}
                />
              ) : event.isLive ? (
                <button
                  className="detail-page__btn detail-page__btn--primary"
                  onClick={handleWatchLive}
                  disabled={streamLoading}
                >
                  {streamLoading ? (
                    <span className="detail-page__btn-spinner"></span>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <circle cx="12" cy="12" r="2" />
                        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
                      </svg>
                      Ver en vivo
                    </>
                  )}
                </button>
              ) : recordings.length > 0 ? (
                <div className="detail-page__recordings">
                  {recordings.map((rec) => (
                    <button
                      key={rec.id}
                      className="detail-page__btn detail-page__btn--primary"
                      onClick={() => handleWatchRecording(rec)}
                      disabled={streamLoading}
                    >
                      {streamLoading ? (
                        <span className="detail-page__btn-spinner"></span>
                      ) : (
                        <>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                          {rec.title}
                        </>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="detail-page__no-stream">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ color: '#EF4444' }}>
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>Este evento no tiene streaming configurado.</span>
                </div>
              )}
              {streamError && <ErrorBanner message={streamError} />}
              {streamBuyOption && (
                <button
                  className="detail-page__btn detail-page__btn--secondary"
                  onClick={() => navigate('/streaming/comprar', { state: streamBuyOption })}
                >
                  Comprar acceso — {formatMoney(streamBuyOption.priceCents, streamBuyOption.currency)}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Ticket sidebar — sticky en desktop, sección normal en mobile */}
        {canGetTicket && (
          <aside className="detail-page__sidebar">
            <div className="detail-page__cta-card">
              <span className="detail-page__cta-title">Conseguí tu entrada</span>
              <p className="detail-page__cta-note">
                Elegí categoría y adicionales en el siguiente paso.
              </p>
              <button
                className="detail-page__btn detail-page__btn--success"
                onClick={() => navigate(`/eventos/${eventId}/checkout`)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  <path d="M13 5v2" />
                  <path d="M13 17v2" />
                  <path d="M13 11v2" />
                </svg>
                Comprar entradas
              </button>
              {hasTicket && (
                <button
                  className="detail-page__btn detail-page__btn--secondary"
                  onClick={() => navigate('/entradas')}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <rect x="7" y="7" width="10" height="10" />
                    <rect x="9" y="9" width="6" height="6" />
                  </svg>
                  Ver mis entradas de este evento
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
