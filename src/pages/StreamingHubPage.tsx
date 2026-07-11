import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { streamingService } from '../services/streamingService';
import { ApiError } from '../services/apiClient';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StreamPlayer } from '../components/StreamPlayer';
import { formatMoney } from '../utils/formatters';
import type { RecordingWithAccess } from '../types/content';
import type { RecordingTokenResponse } from '../types/streaming';
import './StreamingHubPage.css';

export function StreamingHubPage() {
  const navigate = useNavigate();
  const [recordings, setRecordings] = useState<RecordingWithAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playing, setPlaying] = useState<{ recording: RecordingWithAccess; data: RecordingTokenResponse } | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    streamingService.getRecordings()
      .then(setRecordings)
      .catch((e) => setError(e instanceof ApiError ? e.message : 'Error cargando el catálogo.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleWatch = async (rec: RecordingWithAccess) => {
    setPlayingId(rec.id);
    setPlayError(null);
    try {
      const data = await streamingService.getRecordingToken(rec.id);
      setPlaying({ recording: rec, data });
    } catch (e) {
      setPlayError(e instanceof ApiError ? e.message : 'Error al reproducir el contenido.');
    } finally {
      setPlayingId(null);
    }
  };

  const handleBuy = (rec: RecordingWithAccess) => {
    if (!rec.availableAccess.purchase) return;
    navigate('/streaming/comprar', {
      state: {
        type: 'recording',
        id: rec.id,
        title: rec.title,
        priceCents: rec.availableAccess.purchase.priceCents,
        currency: rec.availableAccess.purchase.currency,
      },
    });
  };

  if (loading) return <LoadingSpinner text="Cargando streaming..." />;

  if (error) {
    return (
      <div className="streaming-hub">
        <ErrorBanner message={error} onRetry={load} />
      </div>
    );
  }

  return (
    <div className="streaming-hub">
      <div className="streaming-hub__header">
        <h1 className="streaming-hub__title">Streaming</h1>
        <p className="streaming-hub__subtitle">Transmisiones y videos de INVS — algunos son gratis, otros incluidos en tu suscripción o para comprar sueltos.</p>
      </div>

      {playing && (
        <div className="streaming-hub__player-overlay" onClick={() => setPlaying(null)}>
          <div className="streaming-hub__player-box" onClick={(e) => e.stopPropagation()}>
            <button className="streaming-hub__player-close" onClick={() => setPlaying(null)} aria-label="Cerrar">×</button>
            <StreamPlayer
              playbackUrl={playing.data.hlsUrl ?? playing.data.playbackUrl}
              providerType={playing.data.providerType}
              type="replay"
              title={playing.recording.title}
            />
          </div>
        </div>
      )}

      {playError && <ErrorBanner message={playError} />}

      {recordings.length === 0 ? (
        <div className="streaming-hub__empty">Todavía no hay contenido disponible.</div>
      ) : (
        <div className="streaming-hub__grid">
          {recordings.map((rec) => {
            const canBuy = !rec.granted && !!rec.availableAccess.purchase;
            const subscriptionOnly = !rec.granted && !canBuy && rec.availableAccess.subscription;

            return (
              <article className="content-card" key={rec.id}>
                <div className="content-card__media">
                  {rec.thumbnailUrl ? (
                    <img src={rec.thumbnailUrl} alt={rec.title} className="content-card__img" loading="lazy" />
                  ) : (
                    <div className="content-card__img content-card__img--placeholder" />
                  )}
                  {rec.isFree && <span className="content-card__badge content-card__badge--free">GRATIS</span>}
                </div>
                <div className="content-card__body">
                  <h3 className="content-card__title">{rec.title}</h3>
                  {rec.event && <p className="content-card__meta">De: {rec.event.title}</p>}
                  {rec.description && <p className="content-card__desc">{rec.description}</p>}

                  {rec.granted ? (
                    <button className="content-card__cta content-card__cta--primary" onClick={() => handleWatch(rec)} disabled={playingId === rec.id}>
                      {playingId === rec.id ? 'Cargando...' : '▶ Ver'}
                    </button>
                  ) : canBuy ? (
                    <button className="content-card__cta content-card__cta--buy" onClick={() => handleBuy(rec)}>
                      Comprar {formatMoney(rec.availableAccess.purchase!.priceCents, rec.availableAccess.purchase!.currency)}
                    </button>
                  ) : subscriptionOnly ? (
                    <div className="content-card__note">Incluido con una suscripción activa.</div>
                  ) : (
                    <div className="content-card__note">No disponible por el momento.</div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
