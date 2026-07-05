import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../utils/formatters';
import './QRDisplay.css';

interface QRDisplayProps {
  qrPayload: string;
  used: boolean;
  usedAt?: string | null;
  expiresAt?: string;
}

export function QRDisplay({ qrPayload, used, usedAt, expiresAt }: QRDisplayProps) {
  return (
    <div className="qr-display">
      {used ? (
        <div className="qr-display__used">
          <svg className="qr-display__used-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="qr-display__used-label">ENTRADA UTILIZADA</span>
          {usedAt && (
            <span className="qr-display__used-date">{formatDate(usedAt)}</span>
          )}
        </div>
      ) : (
        <div className="qr-display__active">
          <div className="qr-display__qr-wrapper">
            <QRCodeSVG
              value={qrPayload}
              size={220}
              bgColor="#FFFFFF"
              fgColor="#0B0B12"
              level="M"
              includeMargin
            />
          </div>
          <div className="qr-display__glow"></div>
        </div>
      )}
      <p className="qr-display__note">
        {used
          ? 'Esta entrada ya fue utilizada.'
          : expiresAt
            ? `Válida hasta: ${formatDate(expiresAt)}`
            : 'Mostrá este QR en la entrada del evento.'
        }
      </p>
    </div>
  );
}
