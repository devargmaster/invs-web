import { useNavigate } from 'react-router-dom';
import { formatDate, modeLabel } from '../utils/formatters';
import type { Event } from '../types/events';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();

  return (
    <article
      className="event-card"
      onClick={() => navigate(`/eventos/${event.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/eventos/${event.id}`)}
    >
      <div className="event-card__image-wrapper">
        <img
          src={`https://picsum.photos/seed/${event.id}/600/300`}
          alt={event.title}
          className="event-card__image"
          loading="lazy"
        />
        {event.isLive && (
          <span className="event-card__live-badge">
            <span className="event-card__live-dot"></span>
            EN VIVO
          </span>
        )}
      </div>
      <div className="event-card__content">
        <h3 className="event-card__title">{event.title}</h3>
        <p className="event-card__meta">{formatDate(event.date)}</p>
        {event.location && (
          <p className="event-card__meta">📍 {event.location}</p>
        )}
        <span className="event-card__badge">{modeLabel(event.mode)}</span>
      </div>
    </article>
  );
}
