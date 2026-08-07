import type { ProviderType } from '../types/streaming';
import './StreamPlayer.css';

interface StreamPlayerProps {
  playbackUrl: string;
  providerType?: ProviderType;
  type: 'live' | 'replay';
  title?: string;
}

export function StreamPlayer({ playbackUrl, providerType = 'mux', type, title }: StreamPlayerProps) {
  const isEmbed = providerType === 'youtube' || providerType === 'vimeo' || providerType === 'twitch';

  // Twitch exige un parámetro `parent` con el hostname exacto que sirve la
  // página — no lo manda el backend porque no sabe desde qué dominio se va
  // a ver esto (localhost en dev, el dominio de Vercel en prod), así que
  // se arma acá con el hostname real en tiempo de ejecución.
  const src =
    providerType === 'twitch'
      ? `${playbackUrl}&parent=${window.location.hostname}`
      : playbackUrl.includes('youtube.com/embed')
        ? `${playbackUrl}&autoplay=1&rel=0&modestbranding=1&playsinline=1`
        : playbackUrl;

  return (
    <div className="stream-player">
      {title && (
        <div className="stream-player__header">
          <span className={`stream-player__badge stream-player__badge--${type}`}>
            {type === 'live' ? '● EN VIVO' : '▶ REPLAY'}
          </span>
          <span className="stream-player__title">{title}</span>
        </div>
      )}

      <div className="stream-player__video-wrapper">
        {isEmbed ? (
          <iframe
            src={src}
            className="stream-player__iframe"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={title || 'Stream'}
          />
        ) : (
          <video
            src={playbackUrl}
            className="stream-player__video"
            controls
            autoPlay
            playsInline
          />
        )}
      </div>

      <div className="stream-player__footer">
        <span className="stream-player__provider">
          {providerType === 'mux' ? '⚡ Mux Video'
            : providerType === 'youtube' ? '▶ YouTube'
            : providerType === 'vimeo' ? '🎞 Vimeo'
            : providerType === 'twitch' ? '🟣 Twitch'
            : providerType}
        </span>
      </div>
    </div>
  );
}
