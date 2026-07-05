import './ErrorBanner.css';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner" role="alert">
      <svg className="error-banner__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <p className="error-banner__text">{message}</p>
      {onRetry && (
        <button className="error-banner__retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}
