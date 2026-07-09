import { QRCodeSVG } from 'qrcode.react';
import { formatDate } from '../utils/formatters';
import type { TicketStatus } from '../types/tickets';
import './QRDisplay.css';

interface QRDisplayProps {
  qrPayload: string | null;
  status: TicketStatus;
  usedAt?: string | null;
  expiresAt?: string | null;
}

export function QRDisplay({ qrPayload, status, usedAt, expiresAt }: QRDisplayProps) {
  if (status === 'USED') {
    return (
      <div className="qr-display">
        <div className="qr-display__used">
          <svg className="qr-display__used-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span className="qr-display__used-label">ENTRADA UTILIZADA</span>
          {usedAt && <span className="qr-display__used-date">{formatDate(usedAt)}</span>}
        </div>
        <p className="qr-display__note">Esta entrada ya fue utilizada.</p>
      </div>
    );
  }

  if (status === 'PENDING_PAYMENT' || status === 'CANCELLED' || !qrPayload) {
    return (
      <div className="qr-display">
        <div className="qr-display__used">
          <svg className="qr-display__used-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="qr-display__used-label">
            {status === 'CANCELLED' ? 'ENTRADA CANCELADA' : 'PAGO PENDIENTE DE VALIDACIÓN'}
          </span>
        </div>
        <p className="qr-display__note">
          {status === 'CANCELLED'
            ? 'Esta orden fue cancelada o rechazada.'
            : 'El código QR se genera automáticamente en cuanto se confirme el pago.'}
        </p>
      </div>
    );
  }

  return (
    <div className="qr-display">
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
      <p className="qr-display__note">
        {expiresAt ? `Válida hasta: ${formatDate(expiresAt)}` : 'Mostrá este QR en la entrada del evento.'}
      </p>
    </div>
  );
}
