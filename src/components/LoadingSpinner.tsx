import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text, size = 'md' }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner-container">
      <div className={`loading-spinner loading-spinner--${size}`}>
        <div className="loading-spinner__ring"></div>
      </div>
      {text && <p className="loading-spinner__text">{text}</p>}
    </div>
  );
}
