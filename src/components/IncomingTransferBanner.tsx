import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsService } from '../services/ticketsService';
import type { IncomingTransfer } from '../types/tickets';
import './IncomingTransferBanner.css';

export function IncomingTransferBanner() {
  const navigate = useNavigate();
  const [transfers, setTransfers] = useState<IncomingTransfer[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    ticketsService.getIncomingTransfers().then(setTransfers).catch(() => setTransfers([]));
  }, []);

  const visible = transfers.filter((t) => !dismissed.includes(t.id));
  if (visible.length === 0) return null;

  const transfer = visible[0];

  return (
    <div className="incoming-banner">
      <div className="incoming-banner__icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
          <path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z" />
        </svg>
      </div>
      <div className="incoming-banner__text">
        <b>{transfer.fromUser.fullName}</b> te compartió una entrada para {transfer.ticket.event.title}
      </div>
      <button className="incoming-banner__action" onClick={() => navigate(`/transfers/${transfer.token}`)}>
        Ver
      </button>
      <button
        className="incoming-banner__dismiss"
        aria-label="Cerrar"
        onClick={() => setDismissed((prev) => [...prev, transfer.id])}
      >
        ×
      </button>
    </div>
  );
}
